import express from 'express'
import { Server } from 'socket.io'
import handlebars from 'express-handlebars'
import productRouter from './routes/product.router.js'
import cartRouter from './routes/cart.router.js'
import viewsRouter from './routes/views.router.js'
import ProductManager from './classes/ProductManager.js'

const app = express()
const PORT = 8080

const productManager = new ProductManager('./src/models/products.json')
const httpServer = app.listen(PORT, () =>  console.log(`Server Express Puerto ${PORT}`))
const io = new Server(httpServer)

app.engine('handlebars', handlebars.engine())
app.set('views', './src/views')
app.set('view engine', 'handlebars')

app.use(express.static('./src/public'))
app.use(express.json())

app.use((req, res, next) => {
    req.io = io
    next()
})


app.use('/api/products', productRouter)
app.use('/api/carts', cartRouter)

app.use('/', viewsRouter)

io.on("connection", socket => {
    console.log('A new client has connected to the Server')
    socket.on('productList',async(data) => {
        let products = await productManager.addProducts(data)
        io.emit('updatedProducts', products)
    })
})


