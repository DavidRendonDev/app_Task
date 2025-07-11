// === REFERENCIAS GENERALES ===
const secciones = {
  bienvenida: document.getElementById("vista-bienvenida"),
  registro: document.getElementById("vista-registro"),
  login: document.getElementById("vista-login"),
  tareas: document.getElementById("vista-tareas"),
};
const inputNombreUsuario = document.getElementById("nombre-usuario");

// === ELEMENTOS DE REGISTRO Y LOGIN ===
const regNombre = document.getElementById("reg-nombre");
const regCorreo = document.getElementById("reg-correo");
const regPassword = document.getElementById("reg-password");

const loginCorreo = document.getElementById("login-correo");
const loginPassword = document.getElementById("login-password");

const btnRegistrarse = document.getElementById("btn-registrarse");
const btnLogin = document.getElementById("btn-login");
const btnLogout = document.getElementById("btn-logout");

// === ELEMENTOS DE TAREAS ===
const inputTarea = document.getElementById("nueva-tarea");
const btnAgregar = document.getElementById("btn-agregar");
const listaTareas = document.getElementById("lista-tareas");
let vistaActual = "todas";
let tareas = [];

// === FUNCIONES DE SPA ===
function mostrarVista(nombre) {
  Object.values(secciones).forEach(sec => (sec.style.display = "none"));
  secciones[nombre].style.display = "block";
}

// === FUNCIONES DE USUARIO ===
function guardarUsuarios(lista) {
  localStorage.setItem("usuarios", JSON.stringify(lista));
}

function obtenerUsuarios() {
  return JSON.parse(localStorage.getItem("usuarios")) || [];
}

function guardarUsuarioActivo(usuario) {
  localStorage.setItem("usuarioActivo", JSON.stringify(usuario));
}

function obtenerUsuarioActivo() {
  return JSON.parse(localStorage.getItem("usuarioActivo"));
}

function cerrarSesion() {
  localStorage.removeItem("usuarioActivo");
  mostrarVista("bienvenida");
}

// === REGISTRO con tareas predeterminadas ===
btnRegistrarse.addEventListener("click", () => {
  const nombre = regNombre.value.trim();
  const correo = regCorreo.value.trim();
  const password = regPassword.value.trim();

  if (!nombre || !correo || !password) {
    alert("Por favor completa todos los campos.");
    return;
  }

  const usuarios = obtenerUsuarios();
  const existe = usuarios.find(u => u.correo === correo);
  if (existe) {
    alert("Ese correo ya está registrado.");
    return;
  }

  const nuevoUsuario = { nombre, correo, password };
  usuarios.push(nuevoUsuario);
  guardarUsuarios(usuarios);

  
  const tareasIniciales = [
    { texto: "📚 Leer documentación de JavaScript", completada: false },
    { texto: "💻 Practicar DOM y eventos", completada: false },
    { texto: "🚀 Subir proyecto a GitHub", completada: false }
  ];
  localStorage.setItem(`tareas_${correo}`, JSON.stringify(tareasIniciales));

  alert("¡Registro exitoso! Ahora puedes iniciar sesión.");
  mostrarVista("login");
});

// === LOGIN ===
btnLogin.addEventListener("click", () => {
  const correo = loginCorreo.value.trim();
  const password = loginPassword.value.trim();

  const usuarios = obtenerUsuarios();
  const usuario = usuarios.find(u => u.correo === correo && u.password === password);

  if (!usuario) {
    alert("Credenciales incorrectas.");
    return;
  }

  guardarUsuarioActivo(usuario);
  cargarTareas();
  actualizarVista("todas");
  mostrarVista("tareas");
  inputNombreUsuario.textContent = `👤 Usuario: ${usuario.nombre}`;
});

// === LOGOUT ===
btnLogout.addEventListener("click", () => {
  cerrarSesion();
});

// === TAREAS ===
function guardarTareas() {
  const usuario = obtenerUsuarioActivo();
  if (usuario) {
    localStorage.setItem(`tareas_${usuario.correo}`, JSON.stringify(tareas));
  }
}

function cargarTareas() {
  const usuario = obtenerUsuarioActivo();
  if (!usuario) return;
  const data = localStorage.getItem(`tareas_${usuario.correo}`);
  if (data) {
    tareas = JSON.parse(data);
  } else {
    tareas = [];
  }
}

function mostrarTareas() {
  listaTareas.innerHTML = "";

  tareas.forEach((tarea, index) => {
    if (vistaActual === "completadas" && !tarea.completada) return;

    const div = document.createElement("div");
    div.className = "tarea" + (tarea.completada ? " completada" : "");
    div.innerHTML = `
      <span>${tarea.texto}</span>
      <div>
        <button onclick="completarTarea(${index})">✔️</button>
        <button onclick="eliminarTarea(${index})">🗑️</button>
      </div>
    `;
    listaTareas.appendChild(div);
  });
}

btnAgregar.addEventListener("click", () => {
  const texto = inputTarea.value.trim();
  if (texto !== "") {
    tareas.push({ texto: texto, completada: false });
    inputTarea.value = "";
    guardarTareas();
    mostrarTareas();
  }
});

function completarTarea(index) {
  tareas[index].completada = !tareas[index].completada;
  guardarTareas();
  mostrarTareas();
}

function eliminarTarea(index) {
  if (confirm("¿Estás seguro de eliminar esta tarea?")) {
    tareas.splice(index, 1);
    guardarTareas();
    mostrarTareas();
  }
}

// === FILTRO SPA EN TAREAS ===
function actualizarVista(vista) {
  vistaActual = vista;
  mostrarTareas();
  document.querySelectorAll("nav button").forEach(btn => btn.classList.remove("active"));
  const btnActivo = document.getElementById(`ver-${vista}`);
  if (btnActivo) btnActivo.classList.add("active");
}

document.getElementById("ver-todas").addEventListener("click", () => actualizarVista("todas"));
document.getElementById("ver-completadas").addEventListener("click", () => actualizarVista("completadas"));

// === NAVEGACIÓN ENTRE VISTAS ===
document.getElementById("btn-ir-login").addEventListener("click", () => mostrarVista("login"));
document.getElementById("link-ir-registro").addEventListener("click", () => mostrarVista("registro"));
document.getElementById("link-ir-login").addEventListener("click", () => mostrarVista("login"));
document.getElementById("link-volver-registro").addEventListener("click", () => mostrarVista("registro"));

// === INICIO ===
document.addEventListener("DOMContentLoaded", () => {
  const usuario = obtenerUsuarioActivo();
  if (usuario) {
    cargarTareas();
    mostrarVista("tareas");
    inputNombreUsuario.textContent = `👤 Usuario: ${usuario.nombre}`;
    actualizarVista("todas");
  } else {
    mostrarVista("bienvenida");
  }
});
