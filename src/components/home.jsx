import React, { Fragment, useState, useEffect } from 'react'
import { Button } from '@material-ui/core'
import { firestore } from '../db/firebase'
import { auth } from '../db/firebase'
import { makeStyles } from '@material-ui/core/styles'
import { ShoppingList } from './'

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
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

export default Home
