import React, { Fragment, useState, useEffect } from 'react'
import {
  Button,
  Checkbox,
  List,
  ListItem,
  Collapse,
  ListItemSecondaryAction,
  InputBase,
} from '@material-ui/core'
import { ExpandLess, ExpandMore, Add, DragIndicator } from '@material-ui/icons'
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
  marginRight: {
    marginRight: theme.spacing(1),
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

  const onNewList = () => {
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
      <Button className={classes.button} variant="outlined" onClick={onNewList}>
        New List
      </Button>
    </Fragment>
  )
}

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
        <Add fontSize={'small'} className={classes.marginRight} /> category
      </Button>
    </List>
  )
}

const Category = ({ listId, categoryId, name: nameProp, items: itemsProp }) => {
  const classes = useStyles()
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
        [`categories.${categoryId}.items`]: reorderedItems,
      })
      .then(() => {
        console.log('Document successfully updated!')
      })
      .catch((error) => {
        console.error('Error updating document: ', error)
      })
  }

  const onCheckboxToggle = (e, item, index) => {
    let newItems = [...items]
    newItems[index] = {
      name: item.name,
      checked: e.target.checked,
    }

    firestore
      .collection('shopping_lists')
      .doc(listId)
      .update({
        [`categories.${categoryId}.items`]: newItems,
      })
      .then(() => {
        console.log('Document successfully updated!')
        setItems(newItems)
      })
      .catch((error) => {
        console.error('Error updating document: ', error)
      })
  }

  const onUpdateCategoryName = (e) => {
    let newName = e.target.value
    console.log(e.target.value)

    firestore
      .collection('shopping_lists')
      .doc(listId)
      .update({
        [`categories.${categoryId}.name`]: newName,
      })
      .then(() => {
        console.log('Document successfully updated!')
        setName(newName)
      })
      .catch((error) => {
        console.error('Error updating document: ', error)
      })
  }

  const onUpdateItemName = (e, item, index) => {
    let newItems = [...items]
    newItems[index] = {
      name: e.target.value,
      checked: item.checked,
    }

    firestore
      .collection('shopping_lists')
      .doc(listId)
      .update({
        [`categories.${categoryId}.items`]: newItems,
      })
      .then(() => {
        console.log('Document successfully updated!')
        setItems(newItems)
      })
      .catch((error) => {
        console.error('Error updating document: ', error)
      })
  }

  const onAddItem = () => {
    let newItems = [...items]
    newItems.push({
      name: 'name',
      checked: false,
    })

    firestore
      .collection('shopping_lists')
      .doc(listId)
      .update({
        [`categories.${categoryId}.items`]: newItems,
      })
      .then(() => {
        console.log('Document successfully updated!')
        setItems(newItems)
      })
      .catch((error) => {
        console.error('Error updating document: ', error)
      })
  }

  return (
    <Fragment>
      <ListItem>
        <InputBase
          id={`category-${categoryId}`}
          onChange={onUpdateCategoryName}
          defaultValue={name}
        />
        <ListItemSecondaryAction onClick={() => setOpen(!open)}>
          {open ? <ExpandLess /> : <ExpandMore />}
        </ListItemSecondaryAction>
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <List dense {...provided.droppableProps} ref={provided.innerRef}>
                {items.map((item, index) => (
                  <Draggable
                    key={`${index}-${item.name}`}
                    draggableId={`${index}-${item.name}`}
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
                          <DragIndicator
                            className={classes.marginRight}
                            fontSize={'small'}
                          />
                          <InputBase
                            id={`item-${item.name}`}
                            defaultValue={item.name}
                            onChange={(e) => onUpdateItemName(e, item, index)}
                          />
                          <ListItemSecondaryAction>
                            <Checkbox
                              edge="end"
                              onChange={(e) => onCheckboxToggle(e, item, index)}
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
                ))}
                {provided.placeholder}
                <ListItem button onClick={onAddItem}>
                  <Add fontSize={'small'} className={classes.marginRight} />
                  item
                </ListItem>
              </List>
            )}
          </Droppable>
        </DragDropContext>
      </Collapse>
    </Fragment>
  )
}

export default Home
