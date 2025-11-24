import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Hello World!')
}) 
app.get('/nigga', (req, res) => {
    res.send('Hello nigga!')
}) 

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})