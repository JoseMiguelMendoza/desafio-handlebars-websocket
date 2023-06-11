const socket = io()
const containerProducts = document.getElementById('realTimeProductsBox')

document.getElementById('createProduct').addEventListener('click', () => {
    const body = {
        title: document.getElementById('inputTitle').value,
        description: document.getElementById('inputDescription').value,
        price: document.getElementById('inputPrice').value,
        code: document.getElementById('inputCode').value,
        stock: document.getElementById('inputStock').value,
        category: document.getElementById('inputCategory').value
    }
    fetch('/api/products', {
        method: 'post',
        body: JSON.stringify(body),
        headers: {
            'Content-type': 'application/json'
        },
    })
        .then(result => result.json())
        .then(result => {
            if(result.status == 'error') throw new Error(result.error)
        })
        .then(() => fetch('/api/products'))
        .then(result => result.json())
        .then(result => {
            if(result.status == 'error') throw new Error(result.error)
            else socket.emit('productList', result.body)
            //podemos hacer un toastify
            alert('Producto creado ha sido añadido.')
            document.getElementById('inputTitle').value = ''
            document.getElementById('inputDescription').value = ''
            document.getElementById('inputPrice').value = ''
            document.getElementById('inputCode').value = ''
            document.getElementById('inputStock').value = ''
            document.getElementById('inputCategory').value = ''
        })
        //podemos hacer un toastify
        .catch(err => alert(`Ocurrio un error : (\n${err}`))
})

deleteProduct = (id) => {
    fetch(`/api/products/${id}`, {
        method: 'delete'
    })
        .then(result => result.json())
        .then(result => {
            if(result.status === 'error') throw new Error(result.error)
            //podemos hacer un toastify
            alert('Producto Eliminado con exito.')
        })
        .catch(err => alert(`Ocurrio un error: (\n${err})`))
}

socket.on('updatedProducts', data => {
    if (data !== null) {
        containerProducts.innerHTML = ''; // Limpiar los productos existentes
        data.forEach(product => {
            const productHtml = `
                <div class="containerProductWithId" id="product-${product.id}">
                    <button class="deleteButtonProduct">Eliminar</button>
                    <p class="idProducto">${product.id}</p>
                    <div class="containerProductInfo">
                        <h1>${product.title}</h1>
                        <p class="estiloTexto"><b>Descripción:</b> ${product.description}</p>
                        <p class="estiloTexto"><b>Código:</b> ${product.code}</p>
                        <p class="estiloTexto"><b>Stock:</b> ${product.stock}</p>
                        <p class="estiloTexto"><b>Precio:</b> ${product.price}</p>
                        <p class="estiloTexto"><b>Categoria:</b> ${product.category}</p>
                    </div>
                </div>
            `;
            containerProducts.innerHTML += productHtml; // Agregar el producto al contenedor
        });
    }
});

// Cuando elimino un producto por ThunderClient, me sale undefined.
// El boton eliminar no funciona, nisiquiera elimina.
// Cuando creo un producto por la pagina, me aparece el mensaje de que el producto se ha creado, pero no hace nada. Nisiquiera se crea en la DB o en la pagina.