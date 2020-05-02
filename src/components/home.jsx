import React, { Fragment, useState, useEffect } from 'react'
import {
  Button,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  Collapse,
  ListItemSecondaryAction,
  InputBase,
} from '@material-ui/core'
import { ExpandLess, ExpandMore } from '@material-ui/icons'
import { firestore } from '../db/firebase'
import { auth } from '../db/firebase'
import { makeStyles } from '@material-ui/core/styles'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: theme.palette.background.paper,
    margin: theme.spacing(1),
  },
  button: {
    margin: theme.spacing(1),
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
}))

const Home = () => {
  const classes = useStyles()
  const [lists, setLists] = useState()

  useEffect(() => {
    firestore
      .collection('shopping_lists')
      .where('owner', '==', auth.currentUser.uid)
      .get()
      .then((querySnapshot) => {
        let lists = {}

        querySnapshot.forEach((doc) => {
          lists = { ...lists, [doc.id]: doc.data() }
        })

        setLists(lists)
      })
      .catch((error) => {
        console.log('Error getting documents: ', error)
      })
  }, [])

  const handleNewListClick = (e) => {
    e.preventDefault()

    firestore
      .collection('shopping_lists')
      .add({
        owner: auth.currentUser.uid,
        categories: {},
      })
      .then((docRef) => {
        const newList = {
          [docRef.id]: {
            owner: auth.currentUser.uid,
            categories: {},
          },
        }
        setLists({ ...lists, ...newList })

        console.log('Document written with ID: ', docRef.id)
      })
      .catch((error) => {
        console.error('Error adding document: ', error)
      })
  }

  return (
    <Fragment>
      {lists &&
        Object.keys(lists).map((list, i) => (
          <ShoppingList key={i} id={list} categories={lists[list].categories} />
        ))}
      <Button
        className={classes.button}
        variant="outlined"
        onClick={handleNewListClick}
      >
        New List
      </Button>
    </Fragment>
  )
}

const ShoppingList = ({ id, categories: categoriesProp }) => {
  const [categories, setCategories] = useState(categoriesProp)
  const classes = useStyles()

  const handleAddCategoryClick = (e) => {
    e.preventDefault()

    const newCategory = {
      name: {
        items: [],
      },
    }

    firestore
      .collection('shopping_lists')
      .doc(id)
      .update({
        categories: categories,
      })
      .then(() => {
        setCategories({ ...categories, ...newCategory })

        console.log('Document successfully updated!')
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
            name={category}
            items={categories[category].items}
          ></Category>
        ))}
      <Button
        className={classes.button}
        variant="outlined"
        onClick={handleAddCategoryClick}
      >
        Add Category
      </Button>
    </List>
  )
}

const Category = ({ listId, name: nameProp, items: itemsProp }) => {
  const [name, setName] = useState(nameProp)
  const [items, setItems] = useState(itemsProp)
  const [open, setOpen] = useState(true)

  const getItemStyle = (isDragging, draggableStyle) => ({
    margin: `0 0 6px 0`,

    // styles we need to apply on draggables
    ...draggableStyle,
  })

  const reorder = (items, originalIndex, newIndex) => {
    const newItems = [...items]
    const [removedItem] = newItems.splice(originalIndex, 1)
    newItems.splice(newIndex, 0, removedItem)

    return newItems
  }

  const onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return
    }

    const reorderedItems = reorder(
      items,
      result.source.index,
      result.destination.index
    )

    setItems(reorderedItems)

    firestore
      .collection('shopping_lists')
      .doc(listId)
      .update({
        [`categories.${name}.items`]: reorderedItems,
      })
      .then(() => {
        console.log('Document successfully updated!')
      })
      .catch((error) => {
        console.error('Error updating document: ', error)
      })
  }

  const handleToggle = (e, item, index) => {
    const newItems = [...items]
    newItems[index] = {
      name: item.name,
      checked: e.target.checked,
    }

    setItems(newItems)

    firestore
      .collection('shopping_lists')
      .doc(listId)
      .update({
        [`categories.${name}.items`]: newItems,
      })
      .then(() => {
        console.log('Document successfully updated!')
      })
      .catch((error) => {
        console.error('Error updating document: ', error)
      })
  }

  const handleClick = () => {
    setOpen(!open)
  }

  // TODO make category name a property of category object rather than it's key? and randomly generate the key
  const updateCategoryName = (e) => {
    e.preventDefault()
  }

  // TODO add pencil edit icon button or update as user types?
  return (
    <Fragment>
      <ListItem>
        <InputBase
          id={name}
          onChange={updateCategoryName}
          defaultValue={name}
        />
        <ListItemSecondaryAction onClick={handleClick}>
          {open ? <ExpandLess /> : <ExpandMore />}
        </ListItemSecondaryAction>
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <List dense {...provided.droppableProps} ref={provided.innerRef}>
                {items.map((item, index) => {
                  const labelId = `checkbox-list-secondary-label-${item.name}`
                  return (
                    <Draggable
                      key={item.name}
                      draggableId={item.name}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}
                        >
                          <ListItem key={index}>
                            <InputBase id={labelId} defaultValue={item.name} />
                            <ListItemSecondaryAction>
                              <Checkbox
                                edge="end"
                                onChange={(e) => handleToggle(e, item, index)}
                                checked={item.checked}
                                inputProps={{
                                  'aria-labelledby': item.name,
                                }}
                              />
                            </ListItemSecondaryAction>
                          </ListItem>
                        </div>
                      )}
                    </Draggable>
                  )
                })}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>
      </Collapse>
    </Fragment>
  )
}

export default Home
