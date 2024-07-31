'use client'
import { Box, Stack, Typography, Button, Modal, handleClose, TextField } from '@mui/material'
import { firestore } from '@/firebase';
import { collection, query, doc, getDocs, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

const item = [ 
  'tomato',
  'potato',
  'garlic',
  'bread',
  'carrot',
  'cereal',
  'cookies',
  'granola',
  'oatmeal',
  'peanuts'
]

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

export default function Home() {
  const [pantry, setPantry] = useState([])

  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const [itemName, setItemName] = useState('')

  const updatePantry = async () => {
    const snapshot = query(collection(firestore, 'pantry'))
    const docs = await getDocs(snapshot)
    const pantryList = []
    docs.forEach((doc) => {
      const data = doc.data();
      pantryList.push({"name": doc.id, "count": data.count})
    })
    console.log(pantryList)
    setPantry(pantryList)
  }

  useEffect(() => {
    updatePantry()
  }, [])

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const currentCount = docSnap.data().count;
      await setDoc(docRef, { count: currentCount + 1 });
    } else {
      await setDoc(docRef, { count: 1 });
    }
    await updatePantry()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item.name)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const {count} = docSnap.data()
      if (count == 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, {count: count - 1})
      }
    }
    await updatePantry()
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={'row'} spacing={2}>
            <TextField 
              id="outlined-basic" 
              label="Item" 
              variant="outlined" 
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button variant="outlined"
            onClick={() => {
              addItem(itemName)
              setItemName('')
              handleClose()
            }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Button variant='contained' onClick={handleOpen}>Add</Button>
      <Box border={'1px solid #333'}>
        <Box 
          width='800px' 
          height='100px' 
          bgcolor={'#ADD8E6'} 
          display={'flex'} 
          justifyContent={'center'} 
          alignItems={'center'}
        >
          <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
            Pantry Items
          </Typography>
        </Box>
        <Stack width="800px" height="300px" spacing={2} overflow={'auto'}>
          {pantry.map((item) => (
            <Box
              key = {item.name}
              width="100%"
              minHeight="100px"
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              paddingX={5}
              bgcolor={'#f0f0f0'}
            >
              <Typography
                variant={'h4'}
                color={'#333'}
                textAlign={'center'}
              >
                {
                  item.name.charAt(0).toUpperCase() + item.name.slice(1)
                }
              </Typography>
              <Typography variant="h4" color={'#333'} textAlign={'center'}>
                Quantity: {item.count}
              </Typography>

              <Button variant='contained' onClick={() => removeItem(item)}>
                Remove
              </Button>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}