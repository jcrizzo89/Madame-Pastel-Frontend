jest.mock('../models/Order', () => jest.fn().mockImplementation(function OrderMock(data) {
  this.data = data;
  this.save = jest.fn().mockResolvedValue({ ...data, _id: 'order-1' });
}));
jest.mock('../models/Product', () => ({ findById: jest.fn(), findOneAndUpdate: jest.fn(), updateOne: jest.fn() }));
jest.mock('../models/Inventory', () => ({ findOne: jest.fn() }));

const Order = require('../models/Order');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const { createOrder } = require('../controllers/orderController');

const makeResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
});

const orderRequest = (overrides = {}) => ({
  body: {
    customer: { name: 'Ana', email: 'ana@example.com', phone: '2235551234' },
    products: [{ productId: '507f1f77bcf86cd799439011', name: 'Precio falso', price: 1, quantity: 2 }],
    paymentMethod: 'transfer',
    pickupDate: '2026-12-10',
    totalAmount: 2,
    ...overrides
  }
});

describe('createOrder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Product.findById.mockResolvedValue({ _id: '507f1f77bcf86cd799439011', name: 'Torta real', price: 55000, stock: 5, save: jest.fn() });
    Product.findOneAndUpdate.mockResolvedValue({ _id: '507f1f77bcf86cd799439011' });
    Product.updateOne.mockResolvedValue({ acknowledged: true });
    Inventory.findOne.mockResolvedValue(null);
  });

  it('rejects an empty order without saving', async () => {
    const response = makeResponse();
    await createOrder(orderRequest({ products: [] }), response);
    expect(response.status).toHaveBeenCalledWith(400);
    expect(Order).not.toHaveBeenCalled();
  });

  it('rejects invalid quantities before saving', async () => {
    const response = makeResponse();
    await createOrder(orderRequest({ products: [{ productId: '507f1f77bcf86cd799439011', quantity: -2 }] }), response);
    expect(response.status).toHaveBeenCalledWith(400);
    expect(Order).not.toHaveBeenCalled();
  });

  it('uses catalog prices and computes the order total on the server', async () => {
    const response = makeResponse();
    await createOrder(orderRequest(), response);
    const savedOrder = Order.mock.instances[0];
    expect(savedOrder.data.products).toEqual([{ productId: '507f1f77bcf86cd799439011', name: 'Torta real', price: 55000, quantity: 2 }]);
    expect(savedOrder.data.totalAmount).toBe(110000);
  });

  it('rejects a quantity above available stock', async () => {
    const response = makeResponse();
    await createOrder(orderRequest({ products: [{ productId: '507f1f77bcf86cd799439011', quantity: 6 }] }), response);
    expect(response.status).toHaveBeenCalledWith(409);
    expect(Order).not.toHaveBeenCalled();
  });

  it('rejects a stock race when the atomic reservation finds fewer units', async () => {
    Product.findOneAndUpdate.mockResolvedValueOnce(null);
    const response = makeResponse();
    await createOrder(orderRequest(), response);
    expect(response.status).toHaveBeenCalledWith(409);
    expect(Order).not.toHaveBeenCalled();
  });

  it('restores reserved stock when the order cannot be saved', async () => {
    Order.mockImplementationOnce(function FailedOrder(data) {
      this.data = data;
      this.save = jest.fn().mockRejectedValue(new Error('database unavailable'));
    });
    const response = makeResponse();
    await createOrder(orderRequest(), response);
    expect(Product.updateOne).toHaveBeenCalledWith(
      { _id: '507f1f77bcf86cd799439011' },
      { $inc: { stock: 2 } }
    );
    expect(response.status).toHaveBeenCalledWith(500);
  });
});
