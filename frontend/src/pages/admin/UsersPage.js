import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/constants';
import '../../styles/admin/UsersPage.css';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', role: 'staff', password: '' });
  const token = localStorage.getItem('adminToken');

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/users/all`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(data);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudo cargar el equipo.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const createUser = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      await axios.post(`${API_URL}/auth/register`, form, { headers: { Authorization: `Bearer ${token}` } });
      setForm({ username: '', email: '', role: 'staff', password: '' });
      await loadUsers();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudo crear la cuenta.');
    } finally {
      setSaving(false);
    }
  };

  const updateUser = async (user, changes) => {
    try {
      const { data } = await axios.patch(`${API_URL}/users/${user._id}`, changes, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(current => current.map(item => item._id === data._id ? { ...item, ...data } : item));
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudo actualizar la cuenta.');
    }
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`¿Eliminar el acceso de ${user.username}?`)) return;
    try {
      await axios.delete(`${API_URL}/users/${user._id}`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(current => current.filter(item => item._id !== user._id));
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudo eliminar la cuenta.');
    }
  };

  return (
    <main className="admin-team-page">
      <header className="admin-page-header">
        <div><h1>Equipo</h1><p>Personal gestiona pedidos. Administradores gestionan catálogo y ofertas. Solo la cuenta propietaria administra accesos y configuración.</p></div>
      </header>
      {error && <p className="team-feedback team-error" role="alert">{error}</p>}
      <section className="team-create-section" aria-labelledby="team-create-title">
        <h2 id="team-create-title">Crear acceso</h2>
        <form className="team-create-form" onSubmit={createUser}>
          <label>Nombre de usuario<input required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} autoComplete="off" /></label>
          <label>Email<input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} autoComplete="off" /></label>
          <label>Rol<select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}><option value="staff">Personal: pedidos</option><option value="admin">Administrador: tienda</option></select></label>
          <label>Contraseña temporal<input required type="password" minLength="12" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} autoComplete="new-password" /><small>Mínimo 12 caracteres. Compartila por un canal privado.</small></label>
          <button type="submit" disabled={saving}>{saving ? 'Creando…' : 'Crear acceso'}</button>
        </form>
      </section>
      <section className="team-list-section" aria-labelledby="team-list-title">
        <h2 id="team-list-title">Cuentas existentes</h2>
        {loading ? <p>Cargando equipo…</p> : users.length === 0 ? <p>Todavía no hay cuentas de personal.</p> : (
          <div className="team-table-wrap"><table className="team-table"><thead><tr><th>Usuario</th><th>Email</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>{users.filter(user => user.role !== 'superadmin').map(user => <tr key={user._id}>
              <td>{user.username}</td><td>{user.email}</td>
              <td><select aria-label={`Rol de ${user.username}`} value={user.role} onChange={e => updateUser(user, { role: e.target.value })}><option value="staff">Personal</option><option value="admin">Administrador</option></select></td>
              <td><span className={`team-status ${user.active ? 'is-active' : 'is-inactive'}`}>{user.active ? 'Activo' : 'Desactivado'}</span></td>
              <td className="team-actions"><button type="button" onClick={() => updateUser(user, { active: !user.active })}>{user.active ? 'Desactivar' : 'Activar'}</button><button type="button" className="team-delete" onClick={() => deleteUser(user)}>Eliminar</button></td>
            </tr>)}</tbody></table></div>
        )}
      </section>
    </main>
  );
};

export default UsersPage;
