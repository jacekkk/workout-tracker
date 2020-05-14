import React, { useState } from 'react'
import { Button, List } from '@material-ui/core'
import { Add } from '@material-ui/icons'
import { firestore } from '../db/firebase'
import { makeStyles } from '@material-ui/core/styles'
import { Category } from './'
import firebase from 'firebase'

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: theme.palette.background.paper,
    margin: theme.spacing(1),
  },
  icon: {
    marginRight: theme.spacing(1),
  },
  addCategoryText: {
    fontSize: '1rem',
    textTransform: 'lowercase',
    fontWeight: 400,
  },
  button: {
    width: '100%',
    display: 'flex',
    justifyContent: 'left',
  },
}))

const ShoppingList = ({ id, categories: categoriesProp }) => {
  const classes = useStyles()
  const [categories, setCategories] = useState(categoriesProp)

  const onAddCategory = () => {
    const newCategoryKey = Date.now()

    const newCategory = {
      items: [],
      name: '',
    }

    firestore
      .collection('shopping_lists')
      .doc(id)
      .update({
        [`categories.${newCategoryKey}`]: { ...newCategory },
      })
      .then(() => {
        console.log('Document successfully updated!')
        setCategories({ ...categories, [newCategoryKey]: { ...newCategory } })
      })
      .catch((error) => {
        console.error('Error updating document: ', error)
      })
  }

  const onUpdate = ({ categoryId, name, items }) => {
    const newCategories = { ...categories }
    newCategories[categoryId] = {
      name,
      items,
    }

    setCategories({ ...newCategories })
  }

  const onDeleteCategory = (categoryId) => {
    firestore
      .collection('shopping_lists')
      .doc(id)
      .update({
        [`categories.${categoryId}`]: firebase.firestore.FieldValue.delete(),
      })
      .then(() => {
        console.log('Category successfully deleted!')
        const newCategories = { ...categories }
        delete newCategories[categoryId]

        setCategories(newCategories)
      })
      .catch((error) => {
        console.error('Error updating document: ', error)
      })
  }

  return (
    <List dense className={classes.root}>
      {categories &&
        Object.keys(categories).map((categoryId, index) => (
          <Category
            key={index}
            listId={id}
            categoryId={categoryId}
            name={categories[categoryId].name}
            items={categories[categoryId].items}
            updateShoppingList={(updatedCategory) => onUpdate(updatedCategory)}
            onDeleteCategory={() => onDeleteCategory(categoryId)}
          />
        ))}
      <Button className={classes.button} onClick={onAddCategory}>
        <Add className={classes.icon} />
        <span className={classes.addCategoryText}>category</span>
      </Button>
    </List>
  )
}

export default ShoppingList
