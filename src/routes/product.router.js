import { Router } from 'express'
import ProductManager from '../classes/ProductManager.js'

const router = Router()
const productManager = new ProductManager('./src/models/products.json')
const readProducts = productManager.readProducts()
const getProducts = productManager.getProducts()

const validateProduct = async(res, product) => {
    let products = await readProducts
    const found = products.find(prod => prod.code === product.code)
    if(!product.title) {
        res.status(404).json({ message: 'Está faltando el titulo del producto.'})
        return false
    }
    if(!product.description){
        res.status(404).json({ message: 'Está faltando la descripción del producto.'})
        return false
    } 
    if(!product.price){
        res.status(404).json({ message: 'Está faltando el precio del producto.'})
        return false
    }
    if(!product.code){
        res.status(404).json({ message: 'Está faltando el codigo del producto.'})
        return false
    }
    if(!product.stock){
        res.status(404).json({ message: 'Está faltando el stock del producto.'})
        return false
    }
    if(!product.category){
        res.status(404).json({ message: 'Está faltando la categoría del producto.'})
        return false
    }
    if(!product.status){
        res.status(404).json({ message: 'Está faltando el status del producto.'})
        return false
    }
    if(found){
        res.status(404).json({ message: `Este code: ${product.code} ya existe` })
        return false
    }
    return true
}



router.get('/', async(req, res) => {
    let limit = parseInt(req.query.limit)
    let products = await getProducts
    if(!limit){ 
        return res.status(200).json({ products })
    }
    let limitAndIdExist = products.some(prod => prod.id == limit)
    if(limitAndIdExist){
        let productLimit = products.slice(0, limit)
        return res.status(200).json({ message: `productos desde el 0 hasta ${limit}`, products: productLimit})
    }
    return res.status(404).json({ message: `Error! Solo existe hasta el limit: ${products.length}`})
})


router.get('/:id', async(req, res) => {
    let id = req.params.id
    let productById = await productManager.getProductById(id)
    if(!productById){
        return res.status(404).json({ error: `Error! No existe el id(${id}) en esta lista.` })
    }else{
        return res.status(200).json({ product: productById })
    }
})


router.post('/', async(req, res) => {
    let newProduct = req.body
    if(await validateProduct(res, newProduct)){
        await productManager.addProducts(newProduct)
        req.io.emit('updatedProducts', await readProducts)
        return res.status(200).json({ message: 'Producto Agregado'})
    }
})


router.put('/:id', async(req, res) => {
    let id = req.params.id
    let updateProduct = req.body
    let productUpdated = await productManager.updateProducts(id, updateProduct)
    if(!productUpdated) return res.status(404).json({ message: 'Producto No Encontrado.'})
    if(await validateProduct(res, updateProduct)){
        req.io.emit('updatedProducts', await readProducts)
        return res.status(200).json({ message: 'Producto Actualizado' })
    }
})


router.delete('/:id', async(req, res) => {
    let id = req.params.id
    let products = await readProducts
    let productExists = products.some(prod => prod.id == id)
    if(!productExists) return res.status(404).json({ message: `Producto a eliminar con id: ${id} no existe.`})
    // aqui hemos cambiado. productsUpdated ahora me devuelve el array de objetos sin el id que seleccione.
    let productsUpdated = await productManager.deleteProducts(id)
    req.io.emit('updatedProducts', productsUpdated)
    return res.status(200).json({ message: `el producto con id: ${id} ha sido eliminado.` })

})

export default router