import { Router } from 'express'
import ProductManager from '../classes/ProductManager.js'

const viewsRouter = Router()
const productManager = new ProductManager('./src/models/products.json')

const getProducts = await productManager.getProducts()
viewsRouter.get('/', (req, res) => {
    res.render('home', {
        title: "Programación backEnd | Handlebars",
        products: getProducts
    })
})

viewsRouter.get('/realTimeProducts', (req, res) => {
    res.render('realTimeProducts', {
        title: "Handlebars | Websocket",
        products: getProducts
    })
})

export default viewsRouter