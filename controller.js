const express = require('express')
const router = express.Router()

const sqlite3 = require('sqlite3')
const db = new sqlite3.Database('./db.sqlite')

const numeral = require('numeral')
const moment = require('moment')

/* List all items */
router.get('/', (req, res) => {
  const data = []

  let query = `
      select transactions.id, transaction_types.type_name, item_name, quantity, price_per_item, date
      from transactions
               join transaction_types on transactions.transaction_type = transaction_types.id
   `

  db.each(
    query,
    /* For each row. */
    (err, row) => {
      data.push({
        id: row.id,
        transaction_type: row.type_name,
        item_name: row.item_name,
        quantity: row.quantity,
        price_per_item: to_dollar_format(row.price_per_item),
        total_price: to_dollar_format(row.quantity * row.price_per_item),
        date: row.date,
      })
    },
    /* On complete. */
    () => {
      res.render('index', { title: 'Web Inventory', data })
    },
  )
})

/* New transaction */
router.get('/new-transaction', (req, res) => {
  res.render('form', { title: 'New Transaction' })
})

router.post('/new-transaction', (req, res) => {
  const data = req.body
  const day = data.date_day
  const month = data.date_month
  const year = data.date_year
  const date = `${year}-${month}-${day}`

  const itemNameIsFilled = data.item_name.length > 0
  const quantityIsNotZero = data.quantity > 0
  const priceIsNotZero = data.price_per_item > 0
  const dateIsValid = moment(date, 'YYYY-MM-DD').isValid()

  const formIsCorrect =
    itemNameIsFilled && quantityIsNotZero && priceIsNotZero && dateIsValid

  if (formIsCorrect) {
    db.run(
      `
        insert into transactions (transaction_type, item_name, quantity, price_per_item, date)
        values (?, ?, ?, ?, ?)
      `,
      data.transaction_type,
      data.item_name,
      data.quantity,
      data.price_per_item,
      date,
    )

    res.redirect('/')
  } else {
    res.render('form', {
      title: 'New Transaction',
      item_name_error: !itemNameIsFilled,
      quantity_error: !quantityIsNotZero,
      price_error: !priceIsNotZero,
      date_error: !dateIsValid,
    })
  }
})

/* Clear transactions */
router.post('/clear-transactions', (req, res) => {
  db.run(`delete from transactions`)
  res.redirect('/')
})

/* View sales */
router.get('/view-sales', (req, res) => {
  const data = []

  const query = `
    select transactions.id, item_name, tt.type_name, quantity, price_per_item, date
    from transactions
         join transaction_types tt on transactions.transaction_type = tt.id
    where tt.id = 2
  `

  db.each(
    query,
    /* For each row. */
    (err, row) => {
      data.push({
        id: row.id,
        transaction_type: row.type_name,
        item_name: row.item_name,
        quantity: row.quantity,
        price_per_item: to_dollar_format(row.price_per_item),
        total_price: to_dollar_format(row.quantity * row.price_per_item),
        date: row.date,
      })
    },
    /* On complete. */
    () => {
      res.render('index', { title: 'View Sales', data })
    },
  )
})

/* View purchases */
router.get('/view-purchases', (req, res) => {
  const data = []

  const query = `
    select transactions.id, item_name, tt.type_name, quantity, price_per_item, date
    from transactions
         join transaction_types tt on transactions.transaction_type = tt.id
    where tt.id = 1
  `

  db.each(
    query,
    /* For each row. */
    (err, row) => {
      data.push({
        id: row.id,
        transaction_type: row.type_name,
        item_name: row.item_name,
        quantity: row.quantity,
        price_per_item: to_dollar_format(row.price_per_item),
        total_price: to_dollar_format(row.quantity * row.price_per_item),
        date: row.date,
      })
    },
    /* On complete. */
    () => {
      res.render('index', { title: 'View Purchases', data: data })
    },
  )
})

module.exports = router

function to_dollar_format (number) {
  return numeral(number).format('$ 0,0')
}
