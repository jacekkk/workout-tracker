import React, { Fragment, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Checkbox,
  List,
  ListItem,
  Collapse,
  ListItemSecondaryAction,
  IconButton,
  InputBase,
} from '@material-ui/core'
import {
  ExpandLess,
  ExpandMore,
  Add,
  DragIndicator,
  Delete,
} from '@material-ui/icons'
import { firestore } from '../db/firebase'
import { makeStyles } from '@material-ui/core/styles'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

const useStyles = makeStyles((theme) => ({
  iconStart: {
    fontSize: 'medium',
    padding: '6px',
    marginRight: theme.spacing(1),
  },
  iconEnd: {
    fontSize: 'medium',
    padding: '6px',
  },
  item: {
    paddingLeft: theme.spacing(1),
  },
}))

const Category = ({
  listId,
  categoryId,
  name: nameProp,
  items: itemsProp,
  updateShoppingList,
  onDeleteCategory,
}) => {
  const classes = useStyles()
  const [name, setName] = useState(nameProp)
  const [items, setItems] = useState(itemsProp)
  const [open, setOpen] = useState(true)

  useEffect(() => {
    firestore
      .collection('shopping_lists')
      .doc(listId)
      .update({
        [`categories.${categoryId}.items`]: items,
      })
      .then(() => {
        console.log('Document successfully updated (items in category)!')
        updateShoppingList({ categoryId, name, items })
      })
      .catch((error) => {
        console.error('Error updating document: ', error)
      })
  }, [items])

  useEffect(() => {
    firestore
      .collection('shopping_lists')
      .doc(listId)
      .update({
        [`categories.${categoryId}.name`]: name,
      })
      .then(() => {
        console.log('Document successfully updated (name in category)!')
        updateShoppingList({ categoryId, name, items })
      })
      .catch((error) => {
        console.error('Error updating document: ', error)
      })
  }, [name])

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
  }

  const onCheckboxToggle = (e, item, index) => {
    let newItems = [...items]
    newItems[index] = {
      name: item.name,
      checked: e.target.checked,
    }

    setItems(newItems)
  }

  const onUpdateItemName = (e, item, index) => {
    let newItems = [...items]
    newItems[index] = {
      name: e.target.value,
      checked: item.checked,
    }

    setItems(newItems)
  }

  const onAddItem = () => {
    let newItems = [...items]
    newItems.push({
      name: '',
      checked: false,
    })

    setItems(newItems)
  }

  return (
    <Fragment>
      <ListItem>
        <IconButton
          edge="start"
          aria-label="delete"
          onClick={onDeleteCategory}
          className={classes.iconStart}
        >
          <Delete />
        </IconButton>
        <InputBase
          id={`category-${categoryId}`}
          onBlur={(e) => setName(e.target.value)}
          defaultValue={name}
        />
        <ListItemSecondaryAction onClick={() => setOpen(!open)}>
          <IconButton
            edge="end"
            aria-label="expand"
            className={classes.iconEnd}
          >
            {open ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <List dense {...provided.droppableProps} ref={provided.innerRef}>
                {items.map(
                  (item, index) =>
                    !item.checked && (
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
                              <div className={classes.item}>
                                <IconButton
                                  edge="start"
                                  aria-label="drag"
                                  className={classes.iconStart}
                                >
                                  <DragIndicator />
                                </IconButton>
                                <InputBase
                                  id={`item-${item.name}`}
                                  defaultValue={item.name}
                                  onBlur={(e) =>
                                    onUpdateItemName(e, item, index)
                                  }
                                />
                                <ListItemSecondaryAction>
                                  <Checkbox
                                    edge="end"
                                    onChange={(e) =>
                                      onCheckboxToggle(e, item, index)
                                    }
                                    checked={item.checked}
                                    inputProps={{
                                      'aria-labelledby': item.name,
                                    }}
                                  />
                                </ListItemSecondaryAction>
                              </div>
                            </ListItem>
                          </div>
                        )}
                      </Draggable>
                    )
                )}
                {provided.placeholder}
                <ListItem button onClick={onAddItem}>
                  <Add />
                </ListItem>
              </List>
            )}
          </Droppable>
        </DragDropContext>
      </Collapse>
    </Fragment>
  )
}

Category.propTypes = {
  listId: PropTypes.string.isRequired,
  categoryId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
  updateShoppingList: PropTypes.func.isRequired,
  onDeleteCategory: PropTypes.func.isRequired,
}

export default Category
