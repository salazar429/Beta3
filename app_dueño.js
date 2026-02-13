// ===========================================
// APP DUEÑO - CON SPLASH SCREEN Y PUNTO DE CONEXIÓN
// ===========================================

const API_URL = 'https://sistema-test-api.onrender.com';

// ========== FUNCIONES GLOBALES PARA LOS ONCLICK ==========
function toggleFormVendedora() {
    const form = document.getElementById('formAgregarVendedora');
    const btn = document.getElementById('btnToggleFormVendedora');
    
    if (form.style.display === 'none' || form.style.display === '') {
        form.style.display = 'block';
        btn.innerHTML = '<span>✖️</span><span>Cerrar</span>';
    } else {
        form.style.display = 'none';
        btn.innerHTML = '<span>➕</span><span>Agregar Vendedora</span>';
    }
}

function toggleFormProducto() {
    const form = document.getElementById('formAgregarProducto');
    const btn = document.getElementById('btnToggleFormProducto');
    
    if (form.style.display === 'none' || form.style.display === '') {
        form.style.display = 'block';
        btn.innerHTML = '<span>✖️</span><span>Cerrar</span>';
    } else {
        form.style.display = 'none';
        btn.innerHTML = '<span>➕</span><span>Agregar Producto</span>';
    }
}

function switchPage(page) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });
    
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${page}Section`).classList.add('active');
    
    App.currentPage = page;
}

function toggleFormCategoria() {
    const form = document.getElementById('formAgregarCategoria');
    const btn = document.getElementById('btnToggleFormCategoria');
    
    if (form.style.display === 'none' || form.style.display === '') {
        form.style.display = 'block';
        btn.innerHTML = '<span>✖️</span><span>Cerrar</span>';
    } else {
        form.style.display = 'none';
        btn.innerHTML = '<span>➕</span><span>Nueva Categoría</span>';
    }
}

// ========== OBJETO APP CON TODA LA LÓGICA ==========
const App = {
    currentPage: 'dashboard',
    online: navigator.onLine,
    sincronizando: false,
    
    init() {
        console.log('👑 App Dueño iniciada');
        this.hideSplashScreen();
        this.setupConnectionListener();
        this.verificarConexion();
        this.cargarVendedoras();
        this.cargarProductos();
        this.setupEventListeners();
    },
    
    // ===== SPLASH SCREEN =====
    hideSplashScreen() {
        setTimeout(() => {
            const splash = document.getElementById('splashScreen');
            if (splash) {
                splash.classList.add('hidden');
                setTimeout(() => {
                    splash.style.display = 'none';
                    document.getElementById('mainHeader').style.display = 'block';
                }, 500);
            }
        }, 2000);
    },
    
    // ===== ESTADO DE CONEXIÓN =====
    setupConnectionListener() {
        window.addEventListener('online', () => {
            this.online = true;
            this.actualizarEstadoConexion();
            this.mostrarNotificacion('📶 Conexión restablecida');
            this.verificarConexion();
        });
        
        window.addEventListener('offline', () => {
            this.online = false;
            this.actualizarEstadoConexion();
            this.mostrarNotificacion('📴 Sin conexión - Modo offline');
        });
    },
    
    actualizarEstadoConexion() {
        const dot = document.getElementById('connectionDot');
        if (!dot) return;
        
        dot.className = 'connection-dot';
        
        if (this.sincronizando) {
            dot.classList.add('syncing');
            dot.title = 'Sincronizando...';
        } else if (this.online) {
            dot.classList.add('online');
            dot.title = 'Conectado';
        } else {
            dot.classList.add('offline');
            dot.title = 'Sin conexión';
        }
    },
    
    async verificarConexion() {
        if (!this.online) {
            this.actualizarEstadoConexion();
            return;
        }
        
        this.sincronizando = true;
        this.actualizarEstadoConexion();
        
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Servidor OK - ${data.productos} productos, ${data.vendedoras} vendedoras`);
            }
        } catch (error) {
            console.log('❌ Error conectando al servidor');
        } finally {
            this.sincronizando = false;
            this.actualizarEstadoConexion();
        }
    },

    // ===== CATEGORÍAS =====
async cargarCategorias() {
    const container = document.getElementById('categoriasContainer');
    const countSpan = document.getElementById('categoriasCount');
    
    try {
        const response = await fetch(`${API_URL}/api/dueno/categorias`);
        const categorias = await response.json();
        
        if (countSpan) countSpan.innerText = `(${categorias.length} categorías)`;
        
        if (categorias.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: #7f8c8d;">No hay categorías registradas</div>';
            return;
        }
        
        let html = '';
        categorias.forEach(c => {
            html += `
                <div class="vendedora-card" data-categoria-id="${c.id}">
                    <div class="vendedora-header">
                        <div class="vendedora-avatar" style="background: #3498db;">🏷️</div>
                        <div class="vendedora-info">
                            <div class="vendedora-name">${c.nombre}</div>
                            <div class="vendedora-user" style="font-size: 0.85rem; color: #666;">${c.descripcion || 'Sin descripción'}</div>
                        </div>
                        <span class="badge ${c.activa ? 'activa' : 'inactiva'}">${c.activa ? 'Activa' : 'Inactiva'}</span>
                    </div>
                    <div class="vendedora-actions" style="margin-top: 15px;">
                        <button class="btn btn-sm btn-primary" onclick="App.editarCategoria('${c.id}')">✏️ Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="App.eliminarCategoria('${c.id}')">🗑️ Eliminar</button>
                    </div>
                    
                    <!-- Formulario de edición (oculto) -->
                    <div id="edit-categoria-${c.id}" class="edit-producto-form" style="margin-top: 15px;">
                        <div class="form-group">
                            <label>Nombre</label>
                            <input type="text" id="editCategoriaNombre-${c.id}" class="form-control" value="${c.nombre}">
                        </div>
                        <div class="form-group">
                            <label>Descripción</label>
                            <textarea id="editCategoriaDesc-${c.id}" class="form-control" rows="2">${c.descripcion || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label style="display: flex; align-items: center;">
                                <input type="checkbox" id="editCategoriaActiva-${c.id}" ${c.activa ? 'checked' : ''} style="width: auto; margin-right: 10px;">
                                Categoría activa
                            </label>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <button class="btn btn-success" onclick="App.actualizarCategoria('${c.id}')">Guardar</button>
                            <button class="btn btn-secondary" onclick="App.cancelarEditCategoria('${c.id}')">Cancelar</button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error cargando categorías:', error);
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #e74c3c;">❌ Error cargando categorías</div>';
    }
},

editarCategoria(id) {
    const form = document.getElementById(`edit-categoria-${id}`);
    if (form) {
        form.style.display = 'block';
    }
},

cancelarEditCategoria(id) {
    const form = document.getElementById(`edit-categoria-${id}`);
    if (form) {
        form.style.display = 'none';
    }
},

async actualizarCategoria(id) {
    const nombre = document.getElementById(`editCategoriaNombre-${id}`)?.value.trim();
    const descripcion = document.getElementById(`editCategoriaDesc-${id}`)?.value.trim();
    const activa = document.getElementById(`editCategoriaActiva-${id}`)?.checked;
    
    if (!nombre) {
        alert('❌ El nombre es obligatorio');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/dueno/categorias/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, descripcion, activa })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            this.mostrarNotificacion('✅ Categoría actualizada');
            this.cargarCategorias();
            
            // También actualizar selector de categorías en productos si es visible
            this.cargarCategoriasParaSelect();
        } else {
            alert('❌ Error: ' + (data.error || 'No se pudo actualizar'));
        }
    } catch (error) {
        console.error('Error actualizando categoría:', error);
        alert('❌ Error de conexión');
    }
},

async guardarCategoria() {
    const nombre = document.getElementById('categoriaNombre').value.trim();
    const descripcion = document.getElementById('categoriaDescripcion').value.trim();
    
    const resultado = document.getElementById('categoriaResultado');
    
    if (!nombre) {
        resultado.style.display = 'block';
        resultado.style.background = '#f8d7da';
        resultado.style.color = '#721c24';
        resultado.innerHTML = '❌ El nombre es obligatorio';
        return;
    }
    
    resultado.style.display = 'block';
    resultado.style.background = '#fff3cd';
    resultado.style.color = '#856404';
    resultado.innerHTML = '⏳ Guardando categoría...';
    
    try {
        const response = await fetch(`${API_URL}/api/dueno/categorias`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, descripcion })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            resultado.style.background = '#d4edda';
            resultado.style.color = '#155724';
            resultado.innerHTML = `✅ Categoría "${data.categoria.nombre}" creada`;
            
            document.getElementById('categoriaNombre').value = '';
            document.getElementById('categoriaDescripcion').value = '';
            
            this.cargarCategorias();
            this.cargarCategoriasParaSelect();
            
            // Cerrar formulario
            document.getElementById('formAgregarCategoria').style.display = 'none';
            document.getElementById('btnToggleFormCategoria').innerHTML = '<span>➕</span><span>Nueva Categoría</span>';
            
        } else {
            resultado.style.background = '#f8d7da';
            resultado.style.color = '#721c24';
            resultado.innerHTML = `❌ Error: ${data.error || 'No se pudo crear la categoría'}`;
        }
    } catch (error) {
        console.error('Error guardando categoría:', error);
        resultado.style.background = '#f8d7da';
        resultado.style.color = '#721c24';
        resultado.innerHTML = '❌ Error de conexión con el servidor';
    }
},

async eliminarCategoria(id) {
    if (!confirm('¿Eliminar esta categoría? Los productos que la usan se moverán a "Otros"')) return;
    
    try {
        const response = await fetch(`${API_URL}/api/dueno/categorias/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            this.mostrarNotificacion('✅ Categoría eliminada');
            this.cargarCategorias();
            this.cargarCategoriasParaSelect();
            this.cargarProductos(); // Actualizar productos por si cambiaron
        } else {
            if (data.error && data.productos) {
                alert(`❌ No se puede eliminar:\nProductos: ${data.productos.join(', ')}`);
            } else {
                alert('❌ Error: ' + (data.error || 'No se pudo eliminar'));
            }
        }
    } catch (error) {
        console.error('Error eliminando categoría:', error);
        alert('❌ Error de conexión');
    }
},

// Cargar categorías para el selector en productos
async cargarCategoriasParaSelect() {
    try {
        const response = await fetch(`${API_URL}/api/categorias`);
        const categorias = await response.json();
        
        // Actualizar selector en formulario de producto
        const select = document.getElementById('productoCategoria');
        if (select) {
            let options = '';
            categorias.forEach(c => {
                options += `<option value="${c.id}">${c.nombre}</option>`;
            });
            select.innerHTML = options;
        }
    } catch (error) {
        console.error('Error cargando categorías para select:', error);
    }
},

// Modificar cargarProductos para incluir categorías
async cargarProductos() {
    const container = document.getElementById('productosContainer');
    const countSpan = document.getElementById('productosCount');
    
    try {
        const response = await fetch(`${API_URL}/api/dueno/productos`);
        const productos = await response.json();
        
        if (countSpan) countSpan.innerText = `(${productos.length} productos)`;
        
        if (!productos || productos.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: #7f8c8d;">No hay productos disponibles</div>';
            return;
        }
        
        let html = '';
        productos.forEach(p => {
            const stockClass = p.stock < 5 ? 'stock-danger' : '';
            const statusClass = p.stock < 5 ? 'status-warning' : 'status-active';
            const statusText = p.stock === 0 ? 'SIN STOCK' : p.stock < 5 ? 'BAJO STOCK' : 'DISPONIBLE';
            
            html += `
                <div class="producto-card" data-producto-id="${p.id}">
                    <div class="producto-header">
                        <div>
                            <div class="producto-name">${p.nombre}</div>
                            <div style="font-size: 0.8rem; color: #666; margin-top: 4px;">
                                🏷️ ${p.categoria_nombre || 'General'}
                            </div>
                        </div>
                        <span class="producto-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="producto-details">
                        <div class="detail-item">
                            <span class="detail-label">Precio</span>
                            <span class="detail-value">$${p.precio.toFixed(2)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Stock</span>
                            <span class="detail-value ${stockClass}">${p.stock}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">ID</span>
                            <span class="detail-value">${p.id}</span>
                        </div>
                    </div>
                    <div class="producto-actions">
                        <button class="btn btn-sm btn-primary" onclick="App.toggleEditProducto('${p.id}')">✏️ Modificar</button>
                        <button class="btn btn-sm btn-danger" onclick="App.eliminarProducto('${p.id}')">🗑️ Eliminar</button>
                    </div>
                    
                    <div id="edit-form-${p.id}" class="edit-producto-form">
                        <div style="display: flex; flex-direction: column; gap: 15px;">
                            <div>
                                <label>Nombre</label>
                                <input type="text" id="editNombre-${p.id}" value="${p.nombre}" class="form-control">
                            </div>
                            <div>
                                <label>Categoría</label>
                                <select id="editCategoria-${p.id}" class="form-control">
                                    <!-- Se llenará con JS -->
                                </select>
                            </div>
                            <div style="display: flex; gap: 15px;">
                                <div style="flex: 1;">
                                    <label>Precio</label>
                                    <input type="number" id="editPrecio-${p.id}" value="${p.precio}" step="0.01" class="form-control">
                                </div>
                                <div style="flex: 1;">
                                    <label>Stock</label>
                                    <input type="number" id="editStock-${p.id}" value="${p.stock}" class="form-control">
                                </div>
                            </div>
                            <div style="display: flex; gap: 10px;">
                                <button onclick="App.actualizarProducto('${p.id}')" class="btn btn-success">Guardar</button>
                                <button onclick="App.toggleEditProducto('${p.id}')" class="btn btn-secondary">Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // Llenar selects de categorías después de cargar productos
        await this.cargarCategoriasParaSelect();
        
    } catch (error) {
        console.error('Error cargando productos:', error);
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #e74c3c;">❌ Error cargando productos</div>';
    }
},

// Modificar guardarProducto para usar categorías
async guardarProducto() {
    const nombre = document.getElementById('productoNombre').value.trim();
    const categoria = document.getElementById('productoCategoria').value;
    const precio = parseFloat(document.getElementById('productoPrecio').value);
    const stock = parseInt(document.getElementById('productoStock').value);
    const minStock = parseInt(document.getElementById('productoMinStock').value) || 5;
    
    const resultado = document.getElementById('productoResultado');
    
    if (!nombre || isNaN(precio) || isNaN(stock)) {
        resultado.style.display = 'block';
        resultado.style.background = '#f8d7da';
        resultado.style.color = '#721c24';
        resultado.innerHTML = '❌ Nombre, precio y stock son obligatorios';
        return;
    }
    
    resultado.style.display = 'block';
    resultado.style.background = '#fff3cd';
    resultado.style.color = '#856404';
    resultado.innerHTML = '⏳ Guardando producto...';
    
    try {
        const response = await fetch(`${API_URL}/api/dueno/productos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                nombre, 
                categoria, 
                precio, 
                stock, 
                minStock
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            resultado.style.background = '#d4edda';
            resultado.style.color = '#155724';
            resultado.innerHTML = `✅ Producto creado: ${data.producto.nombre}`;
            
            document.getElementById('productoNombre').value = '';
            document.getElementById('productoPrecio').value = '';
            document.getElementById('productoStock').value = '';
            document.getElementById('productoMinStock').value = '5';
            
            this.cargarProductos();
            
            document.getElementById('formAgregarProducto').style.display = 'none';
            document.getElementById('btnToggleFormProducto').innerHTML = '<span>➕</span><span>Agregar Producto</span>';
        } else {
            resultado.style.background = '#f8d7da';
            resultado.style.color = '#721c24';
            resultado.innerHTML = `❌ Error: ${data.error || 'No se pudo crear el producto'}`;
        }
    } catch (error) {
        console.error('Error guardando producto:', error);
        resultado.style.background = '#f8d7da';
        resultado.style.color = '#721c24';
        resultado.innerHTML = '❌ Error de conexión con el servidor';
    }
},

// Modificar actualizarProducto para incluir categoría
async actualizarProducto(id) {
    const nombre = document.getElementById(`editNombre-${id}`)?.value;
    const categoria = document.getElementById(`editCategoria-${id}`)?.value;
    const precio = parseFloat(document.getElementById(`editPrecio-${id}`)?.value);
    const stock = parseInt(document.getElementById(`editStock-${id}`)?.value);
    
    if (!nombre || isNaN(precio) || isNaN(stock)) {
        alert('❌ Todos los campos son obligatorios');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/dueno/productos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, categoria, precio, stock })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            this.mostrarNotificacion('✅ Producto actualizado correctamente');
            this.cargarProductos();
        } else {
            alert('❌ Error: ' + (data.error || 'No se pudo actualizar'));
        }
    } catch (error) {
        console.error('Error actualizando producto:', error);
        alert('❌ Error actualizando producto');
    }
},
    
    // ===== SERVIDOR =====
    async testServerConnection() {
        await this.verificarConexion();
    },
    
    // ===== VENDEDORAS =====
    async cargarVendedoras() {
        const container = document.getElementById('vendedorasContainer');
        const countSpan = document.getElementById('vendedorasCount');
        
        try {
            const response = await fetch(`${API_URL}/api/dueno/vendedoras`);
            const vendedoras = await response.json();
            
            if (countSpan) countSpan.innerText = `(${vendedoras.length} vendedoras)`;
            
            if (vendedoras.length === 0) {
                container.innerHTML = '<div style="text-align: center; padding: 40px; color: #7f8c8d;">No hay vendedoras registradas</div>';
                return;
            }
            
            // Ordenar: primero inactivas, luego activas
            const ordenadas = [...vendedoras].sort((a, b) => {
                if (a.status === 'inactiva' && b.status === 'activa') return -1;
                if (a.status === 'activa' && b.status === 'inactiva') return 1;
                return 0;
            });
            
            let html = '';
            ordenadas.forEach(v => {
                html += `
                    <div class="vendedora-card">
                        <div class="vendedora-header">
                            <div class="vendedora-avatar">${v.nombre.charAt(0)}</div>
                            <div class="vendedora-info">
                                <div class="vendedora-name">${v.nombre}</div>
                                <div class="vendedora-user">@${v.usuario}</div>
                            </div>
                            <span class="vendedora-status status-${v.status}">${v.status}</span>
                        </div>
                        <div class="vendedora-details">
                            <div class="detail-item">
                                <span class="detail-label">Tienda</span>
                                <span class="detail-value">${v.tienda}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">ID</span>
                                <span class="detail-value">${v.id}</span>
                            </div>
                        </div>
                        <div class="vendedora-actions">
                            <button class="btn btn-sm btn-danger" onclick="App.eliminarVendedora('${v.id}')">🗑️ Eliminar</button>
                        </div>
                    </div>
                `;
            });
            
            container.innerHTML = html;
            
        } catch (error) {
            console.error('Error cargando vendedoras:', error);
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: #e74c3c;">❌ Error cargando vendedoras</div>';
        }
    },
    
    async guardarVendedora() {
        const nombre = document.getElementById('vendedoraNombre').value.trim();
        const usuario = document.getElementById('vendedoraUsuario').value.trim();
        const password = document.getElementById('vendedoraPassword').value.trim();
        const tienda = document.getElementById('vendedoraTienda').value.trim() || 'Tienda General';
        
        const resultado = document.getElementById('vendedoraResultado');
        
        if (!nombre || !usuario || !password) {
            resultado.style.display = 'block';
            resultado.style.background = '#f8d7da';
            resultado.style.color = '#721c24';
            resultado.innerHTML = '❌ Nombre, usuario y contraseña son obligatorios';
            return;
        }
        
        resultado.style.display = 'block';
        resultado.style.background = '#fff3cd';
        resultado.style.color = '#856404';
        resultado.innerHTML = '⏳ Guardando vendedora...';
        
        try {
            const response = await fetch(`${API_URL}/api/dueno/vendedoras`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, usuario, password, tienda })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                resultado.style.background = '#d4edda';
                resultado.style.color = '#155724';
                resultado.innerHTML = `✅ Vendedora creada: ${data.vendedora.nombre} (@${data.vendedora.usuario})`;
                
                document.getElementById('vendedoraNombre').value = '';
                document.getElementById('vendedoraUsuario').value = '';
                document.getElementById('vendedoraPassword').value = '123456';
                document.getElementById('vendedoraTienda').value = '';
                
                this.cargarVendedoras();
                
                // Cerrar formulario
                document.getElementById('formAgregarVendedora').style.display = 'none';
                document.getElementById('btnToggleFormVendedora').innerHTML = '<span>➕</span><span>Agregar Vendedora</span>';
            } else {
                resultado.style.background = '#f8d7da';
                resultado.style.color = '#721c24';
                resultado.innerHTML = `❌ Error: ${data.error || 'No se pudo crear la vendedora'}`;
            }
        } catch (error) {
            console.error('Error guardando vendedora:', error);
            resultado.style.background = '#f8d7da';
            resultado.style.color = '#721c24';
            resultado.innerHTML = '❌ Error de conexión con el servidor';
        }
    },
    
    async eliminarVendedora(id) {
        if (!confirm('¿Eliminar esta vendedora?')) return;
        
        try {
            const response = await fetch(`${API_URL}/api/dueno/vendedoras/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                this.cargarVendedoras();
                this.mostrarNotificacion('✅ Vendedora eliminada');
            }
        } catch (error) {
            console.error('Error eliminando vendedora:', error);
            alert('❌ Error eliminando vendedora');
        }
    },
    
    // ===== PRODUCTOS =====
    async cargarProductos() {
        const container = document.getElementById('productosContainer');
        const countSpan = document.getElementById('productosCount');
        
        try {
            const response = await fetch(`${API_URL}/api/dueno/productos`);
            const productos = await response.json();
            
            if (countSpan) countSpan.innerText = `(${productos.length} productos)`;
            
            if (!productos || productos.length === 0) {
                container.innerHTML = '<div style="text-align: center; padding: 40px; color: #7f8c8d;">No hay productos disponibles</div>';
                return;
            }
            
            let html = '';
            productos.forEach(p => {
                const stockClass = p.stock < 5 ? 'stock-danger' : '';
                const statusClass = p.stock < 5 ? 'status-warning' : 'status-active';
                const statusText = p.stock === 0 ? 'SIN STOCK' : p.stock < 5 ? 'BAJO STOCK' : 'DISPONIBLE';
                
                html += `
                    <div class="producto-card" data-producto-id="${p.id}">
                        <div class="producto-header">
                            <div class="producto-name">${p.nombre}</div>
                            <span class="producto-status ${statusClass}">
                                ${statusText}
                            </span>
                        </div>
                        <div class="producto-details">
                            <div class="detail-item">
                                <span class="detail-label">Precio</span>
                                <span class="detail-value">$${p.precio.toFixed(2)}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Stock</span>
                                <span class="detail-value ${stockClass}">${p.stock}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Categoría</span>
                                <span class="detail-value">${p.categoria || 'General'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">ID</span>
                                <span class="detail-value">${p.id}</span>
                            </div>
                        </div>
                        <div class="producto-actions">
                            <button class="btn btn-sm btn-primary" onclick="App.toggleEditProducto('${p.id}')">✏️ Modificar</button>
                            <button class="btn btn-sm btn-danger" onclick="App.eliminarProducto('${p.id}')">🗑️ Eliminar</button>
                        </div>
                        
                        <div id="edit-form-${p.id}" class="edit-producto-form">
                            <div style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                                <div style="flex: 1;">
                                    <label>Nombre</label>
                                    <input type="text" id="editNombre-${p.id}" value="${p.nombre}" class="form-control">
                                </div>
                                <div style="width: 150px;">
                                    <label>Precio</label>
                                    <input type="number" id="editPrecio-${p.id}" value="${p.precio}" step="0.01" class="form-control">
                                </div>
                                <div style="width: 120px;">
                                    <label>Stock</label>
                                    <input type="number" id="editStock-${p.id}" value="${p.stock}" class="form-control">
                                </div>
                                <div>
                                    <button onclick="App.actualizarProducto('${p.id}')" class="btn btn-success">Guardar</button>
                                    <button onclick="App.toggleEditProducto('${p.id}')" class="btn btn-secondary">Cancelar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            container.innerHTML = html;
            
        } catch (error) {
            console.error('Error cargando productos:', error);
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: #e74c3c;">❌ Error cargando productos</div>';
        }
    },
    
    toggleEditProducto(id) {
        const form = document.getElementById(`edit-form-${id}`);
        if (form) {
            if (form.style.display === 'none' || form.style.display === '') {
                form.style.display = 'block';
            } else {
                form.style.display = 'none';
            }
        }
    },
    
    async guardarProducto() {
        const nombre = document.getElementById('productoNombre').value.trim();
        const categoria = document.getElementById('productoCategoria').value;
        const precio = parseFloat(document.getElementById('productoPrecio').value);
        const stock = parseInt(document.getElementById('productoStock').value);
        const minStock = parseInt(document.getElementById('productoMinStock').value) || 5;
        
        const resultado = document.getElementById('productoResultado');
        
        if (!nombre || isNaN(precio) || isNaN(stock)) {
            resultado.style.display = 'block';
            resultado.style.background = '#f8d7da';
            resultado.style.color = '#721c24';
            resultado.innerHTML = '❌ Nombre, precio y stock son obligatorios';
            return;
        }
        
        resultado.style.display = 'block';
        resultado.style.background = '#fff3cd';
        resultado.style.color = '#856404';
        resultado.innerHTML = '⏳ Guardando producto...';
        
        try {
            const response = await fetch(`${API_URL}/api/dueno/productos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    nombre, 
                    categoria, 
                    precio, 
                    stock, 
                    minStock
                })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                resultado.style.background = '#d4edda';
                resultado.style.color = '#155724';
                resultado.innerHTML = `✅ Producto creado: ${data.producto.nombre}`;
                
                document.getElementById('productoNombre').value = '';
                document.getElementById('productoPrecio').value = '';
                document.getElementById('productoStock').value = '';
                document.getElementById('productoMinStock').value = '5';
                
                this.cargarProductos();
                
                // Cerrar formulario
                document.getElementById('formAgregarProducto').style.display = 'none';
                document.getElementById('btnToggleFormProducto').innerHTML = '<span>➕</span><span>Agregar Producto</span>';
            } else {
                resultado.style.background = '#f8d7da';
                resultado.style.color = '#721c24';
                resultado.innerHTML = `❌ Error: ${data.error || 'No se pudo crear el producto'}`;
            }
        } catch (error) {
            console.error('Error guardando producto:', error);
            resultado.style.background = '#f8d7da';
            resultado.style.color = '#721c24';
            resultado.innerHTML = '❌ Error de conexión con el servidor';
        }
    },
    
    async actualizarProducto(id) {
        const nombre = document.getElementById(`editNombre-${id}`)?.value;
        const precio = parseFloat(document.getElementById(`editPrecio-${id}`)?.value);
        const stock = parseInt(document.getElementById(`editStock-${id}`)?.value);
        
        if (!nombre || isNaN(precio) || isNaN(stock)) {
            alert('❌ Todos los campos son obligatorios');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/api/dueno/productos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, precio, stock })
            });
            
            if (response.ok) {
                this.cargarProductos();
                this.mostrarNotificacion('✅ Producto actualizado correctamente');
            }
        } catch (error) {
            console.error('Error actualizando producto:', error);
            alert('❌ Error actualizando producto');
        }
    },
    
    async eliminarProducto(id) {
        if (!confirm('¿Eliminar este producto?')) return;
        
        try {
            const response = await fetch(`${API_URL}/api/dueno/productos/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                this.cargarProductos();
                this.mostrarNotificacion('✅ Producto eliminado');
            }
        } catch (error) {
            console.error('Error eliminando producto:', error);
            alert('❌ Error eliminando producto');
        }
    },
    
    // ===== NOTIFICACIONES =====
    mostrarNotificacion(mensaje) {
        const notif = document.getElementById('notification');
        if (notif) {
            notif.style.display = 'block';
            notif.textContent = mensaje;
            setTimeout(() => {
                notif.style.display = 'none';
            }, 3000);
        }
    },
    
    setupEventListeners() {
        document.getElementById('btnTestServer')?.addEventListener('click', () => this.testServerConnection());
    }
};

// Iniciar app
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
