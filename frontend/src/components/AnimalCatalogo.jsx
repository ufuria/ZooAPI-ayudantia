import { useState, useEffect } from 'react';
import { API_URL } from '../api/config';

function AnimalCatalogo() {
  //  1 — estados
  const [animales, setAnimales] = useState([]);
  const [especies, setEspecies] = useState([]);      // opciones del select
  const [recintos, setRecintos] = useState([]);      // opciones del select
  const [especieId, setEspecieId] = useState('');    // qué está seleccionado
  const [recintoId, setRecintoId] = useState('');
  const [animalSeleccionado, setAnimalSeleccionado] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [form, setForm] = useState({ autor: '', calificacion: 5, comentario: '' });
  const [errorForm, setErrorForm] = useState(null);

  //  2 — efectos (un useEffect por cada cosa que se pide al backend)

  // 2.a  llenar las opciones de los selects: una sola vez
  useEffect(() => {
    fetch(`${API_URL}/especies`).then(r => r.json()).then(setEspecies);
    fetch(`${API_URL}/recintos`).then(r => r.json()).then(setRecintos);
  }, []);

  // 2.b  la lista de animales: cada vez que cambia un filtro
  useEffect(() => {
    const params = new URLSearchParams();
    if (especieId) params.append('especieId', especieId);
    if (recintoId) params.append('recintoId', recintoId);
    fetch(`${API_URL}/animals?${params}`).then(r => r.json()).then(setAnimales);
  }, [especieId, recintoId]);

  // 2.c  los comentarios: cada vez que cambia el animal seleccionado
  useEffect(() => {
    if (!animalSeleccionado) return;
    fetch(`${API_URL}/animals/${animalSeleccionado.id}/comments`)
      .then(r => r.json())
      .then(data => setComentarios(data.comentarios));
  }, [animalSeleccionado]);

  // ZONA 3 — handler del formulario (POST)
  const enviarComentario = async () => { 
    setErrorForm(null);
  const res = await fetch(`${API_URL}/animals/${animalSeleccionado.id}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...form, calificacion: Number(form.calificacion) }),
  });
  const data = await res.json();

  if (!res.ok) {                                    // aquí cae el 400 de Zod
    setErrorForm(data.detalles.map(d => d.mensaje).join(', '));
    return;
  }
  setComentarios([data, ...comentarios]);           // agregarlo sin recargar
  setForm({ autor: '', calificacion: 5, comentario: '' });
   };

  // ZONA 4 — JSX
  return ( 
    <div>
    <h2>Animales</h2>

    {/* 1. filtros */}
    <select value={especieId} onChange={(e) => setEspecieId(e.target.value)}>
      <option value="">Todas las especies</option>
      {especies.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
    </select>
    {/* mismo select para recintos */}

    {/* 2. lista */}
    <ul>
      {animales.map((a) => (
        <li key={a.id} onClick={() => setAnimalSeleccionado(a)} style={{ cursor: 'pointer' }}>
          {a.nombre} — {a.especie.nombre}
        </li>
      ))}
    </ul>

    {/* 3 y 4. solo si hay un animal seleccionado */}
    {animalSeleccionado && (
      <div>
        {/* detalle: nombre, edad, especie.nombre, recinto.nombre */}
        <p>Nombre: {animalSeleccionado.nombre}</p>
        <p>Edad: {animalSeleccionado.edad}</p>
        <p>Especie: {animalSeleccionado.especie.nombre}</p>
        <p>Recinto: {animalSeleccionado.recinto.nombre}</p>
        {/* lista de comentarios: comentarios.map(...) */}
        <h3>Comentarios</h3>
        <ul>
          {comentarios.map((c) => (
            <li key={c.id}>
              <strong>{c.autor}</strong> ({c.calificacion}/5): {c.comentario}
            </li>
          ))}
        </ul>
        {/* formulario: inputs controlados con form/setForm + botón que llama a enviarComentario */}
        {errorForm && <p style={{ color: 'red' }}>{errorForm}</p>}
      </div>
    )}
  </div>
  );
}

export default AnimalCatalogo;