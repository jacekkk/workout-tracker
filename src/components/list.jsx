import React, { useState } from 'react'
import { Button, List } from '@material-ui/core'
import { Add } from '@material-ui/icons'
import { firestore } from '../db/firebase'
import { makeStyles } from '@material-ui/core/styles'
import { Category } from './'

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: theme.palette.background.paper,
    margin: theme.spacing(1),
  },
  icon: {
    fontSize: 'small',
    marginRight: theme.spacing(1),
  },
  addCategoryText: {
    fontSize: '1rem',
    textTransform: 'lowercase',
    fontWeight: 400,
  },
}))

const ShoppingList = ({ id, categories: categoriesProp }) => {
  const classes = useStyles()
  const [categories, setCategories] = useState(categoriesProp)

  const onAddCategory = () => {
    const newCategoryKey = Date.now()

    const newCategory = {
      [newCategoryKey]: {
        items: [],
        name: 'name',
      },
    }

    firestore
      .collection('shopping_lists')
      .doc(id)
      .update({
        categories: { ...categories, ...newCategory },
      })
      .then(() => {
        console.log('Document successfully updated!')
        setCategories({ ...categories, ...newCategory })
      })
      .catch((error) => {
        console.error('Error updating document: ', error)
      })
  }

  return (
    <List dense className={classes.root}>
      {categories &&
        Object.keys(categories).map((category, index) => (
          <Category
            key={index}
            listId={id}
            categoryId={category}
            name={categories[category].name}
            items={categories[category].items}
          ></Category>
        ))}
      <Button onClick={onAddCategory}>
        <Add className={classes.icon} />
        <span className={classes.addCategoryText}>category</span>
      </Button>
    </List>
  )
}

export default ShoppingList
