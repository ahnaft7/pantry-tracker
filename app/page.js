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
  const [itemName, setItemName] = useState('')
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

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

  const filteredPantry = pantry.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
      padding={2}
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
            <Button variant="outlined" sx={{ borderRadius: '8px' }}
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
      <Button 
        variant='contained' 
        sx={{ borderRadius: '8px', padding: '10px 20px' }}  
        onClick={handleOpen}>
          Add
      </Button>
      <Box width="800px" display="flex" flexDirection="column" gap={2}>
        <TextField 
          label="Search Items" 
          variant="outlined" 
          fullWidth 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ marginBottom: '16px', borderRadius: '8px' }}
        />
        <Box
          width="100%" 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          border={'1px solid #333'}
          borderRadius={'25px'}
          overflow={'hidden'}
          boxShadow={'0 4px 8px rgba(0,0,0,0.1)'}
        >
          <Box 
            width='90%' 
            height='80px' 
            bgcolor={'#ADD8E6'} 
            display={'flex'} 
            justifyContent={'center'} 
            alignItems={'center'}
            borderRadius={'25px 25px 25px 25px'}
            textAlign={'center'}
            marginTop="16px"
          >
            <Typography variant={'h4'} color={'#333'} textAlign={'center'}>
              Pantry Items
            </Typography>
          </Box>
          <Stack width="100%" height="300px" spacing={2} overflow={'auto'} padding={2} alignItems="center" >
            {filteredPantry.map((item) => (
              <Box
                key = {item.name}
                width="80%"
                minHeight="60px"
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}
                paddingX={5}
                bgcolor={'#f0f0f0'}
                borderRadius={'25px'}
                boxShadow={'0 2px 4px rgba(0,0,0,0.1)'}
                sx={{
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  }
                }}
              >
                <Typography
                  variant={'h6'}
                  color={'#333'}
                  textAlign={'center'}
                >
                  {
                    item.name.charAt(0).toUpperCase() + item.name.slice(1)
                  }
                </Typography>
                <Typography variant="h7" color={'#333'} textAlign={'center'}>
                  Quantity: {item.count}
                </Typography>

                <Button 
                variant='contained' 
                sx={{ borderRadius: '8px', backgroundColor: '#d32f2f' }}
                onClick={() => removeItem(item)}>
                  Remove
                </Button>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}