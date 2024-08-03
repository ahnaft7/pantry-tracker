'use client'
import { Box, Stack, Typography, Button, Modal, handleClose, TextField } from '@mui/material'
import { firestore, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, query, doc, getDocs, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Camera } from 'react-camera-pro';

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
  width: { xs: '90%', sm: 400 },
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

const cameraContainerStyle = {
  width: '100%',
  height: '200px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

export default function Home() {
  const [pantry, setPantry] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [searchTerm, setSearchTerm] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [imageURL, setImageURL] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCaptured, setIsCaptured] = useState(false);
  const [classificationResult, setClassificationResult] = useState('');
  const cameraRef = useRef(null);

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const handleCameraOpen = () => setCameraOpen(true);
  const handleCameraClose = () => setCameraOpen(false);

  const handleCapture = useCallback(async () => {
    if (capturedImage) {
      try {
        // Generate a unique file name
        const fileName = `captured_image_${Date.now()}.jpg`;
        
        // Create a Blob from the base64 string
        const response = await fetch(capturedImage);
        const blob = await response.blob();

        const storageRef = ref(storage, `images/${fileName}`);

        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
        setImageURL(downloadURL);
        console.log('Uploaded Image URL:', downloadURL);
        
        await classifyImage(downloadURL);

        setCapturedImage(null);
        setIsCaptured(false);
        handleCameraClose();
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  }, [capturedImage]);

  const handleCaptureImage = useCallback(() => {
    if (cameraRef.current) {
      const photo = cameraRef.current.takePhoto();
      setCapturedImage(photo);
      setIsCaptured(true);
    }
  }, []);

  const handleRetakeImage = useCallback(() => {
    setCapturedImage(null);
    setIsCaptured(false);
  }, []);

  const classifyImage = async (imageURL) => {
    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageURL })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.error}`);
      }
  
      const result = await response.json();
      console.log('Classification Result:', result);
      console.log('Classified Item:', result.classifiedItem)
      setClassificationResult(result.classifiedItem);
  
      if (result.classifiedItem) {
        addItem(result.classifiedItem);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };
  
  
  
  
  

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
    const itemNameLower = item.toLowerCase();
    const docRef = doc(collection(firestore, 'pantry'), itemNameLower)
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
    const itemNameLower = item.name.toLowerCase();
    const docRef = doc(collection(firestore, 'pantry'), itemNameLower)
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
      <Typography variant="h6" sx={{ marginTop: 2 }}>
        Last Image Added: {classificationResult}
      </Typography>
      <Button 
        variant='contained' 
        sx={{ borderRadius: '8px', padding: { xs: '8px 16px', sm: '10px 20px' } }}
        onClick={handleOpen}>
          Add New Item
      </Button>
      <Button
        variant='contained'
        sx={{ borderRadius: '8px', padding: { xs: '8px 16px', sm: '10px 20px' } }}
        onClick={handleCameraOpen}
      >
        Add Image
      </Button>
      {cameraOpen && (
        <Modal
          open={cameraOpen}
          onClose={handleCameraClose}
          aria-labelledby="camera-modal-title"
          aria-describedby="camera-modal-description"
        >
          <Box sx={style}>
            <Typography id="camera-modal-title" variant="h6" component="h2">
              Camera Loading...
            </Typography>
            {!isCaptured ? (
              <Box sx={cameraContainerStyle}>
                <Camera ref={cameraRef} />
                <Stack direction='row' spacing={2} sx={{ marginTop: 4, marginBottom: 2, position: 'relative', top: '80px' }}>
                  <Button 
                    variant="contained"
                    sx={{ borderRadius: '8px', marginTop: 2 }}
                    onClick={handleCaptureImage}
                  >
                    Capture Photo
                  </Button>
                  <Button 
                    variant="contained"
                    sx={{ borderRadius: '8px', marginTop: 2 }}
                    onClick={() => {
                      cameraRef.current.switchCamera();
                    }}
                  >
                    Switch Camera
                  </Button>
                </Stack>
              </Box>
            ) : (
              <>
                <img src={capturedImage} alt="Captured" style={{ width: '100%', height: 'auto' }} />
                <Button 
                  variant="contained"
                  sx={{ borderRadius: '8px', marginTop: 2 }}
                  onClick={handleRetakeImage}
                >
                  Retake Photo
                </Button>
                <Button 
                  variant="contained"
                  sx={{ borderRadius: '8px', marginTop: 2 }}
                  onClick={handleCapture}
                >
                  Upload Image
                </Button>
              </>
            )}
          </Box>
        </Modal>
      )}
      <Box width={{ xs: '100%', sm: '800px' }} display="flex" flexDirection="column" alignItems="center" gap={2}>
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
            <Typography 
              variant={'h4'} 
              color={'#333'} 
              textAlign={'center'} 
              sx={{ fontSize: { xs: '28px', sm: '32px' } }}
            >
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
                  sx={{ 
                    fontSize: { xs: '14px', sm: '18px' }
                  }}
                >
                  {
                    item.name.charAt(0).toUpperCase() + item.name.slice(1)
                  }
                </Typography>
                <Typography 
                  variant="h7" 
                  color={'#333'} 
                  textAlign={'center'}
                  sx={{ 
                    fontSize: { xs: '12px', sm: '16px' }
                  }}
                >
                  Quantity: {item.count}
                </Typography>

                <Button 
                variant='contained' 
                sx={{ borderRadius: '8px', backgroundColor: '#d32f2f', padding: { xs: '4px 12px', sm: '6px 14px' }}}
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