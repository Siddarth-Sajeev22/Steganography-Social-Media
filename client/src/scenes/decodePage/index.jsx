import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { IconButton, Grid, Card, CardContent, Typography, TextField, CircularProgress, Button } from "@mui/material";

const DecodePage = () => {
    const { imageUrl } = useParams();
    const [decodedData, setDecodedData] = useState("");
    const [accessKey, setAccessKey] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        handleGetAccessKey();
    }, [])

    const handleGetAccessKey = async () => {
        try {
          const response = await fetch(`http://localhost:3001/posts/${imageUrl}/getAccessKey`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
    
          if (!response.ok) {
            throw new Error('Failed to fetch access key');
          }
    
          const data = await response.json();
          setAccessKey(data.accessKey);
        } catch (error) {
          console.error('Error fetching access key:', error);
        }
      };

    const decodeImage = async () => {
        setLoading(true);
        try {
            // Fetch the image from the URL
            const response = await fetch(`http://localhost:3001/assets/${imageUrl}`);
            const blob = await response.blob();

            // Create a File object from the Blob with a custom filename (optional)
            const file = new File([blob], 'image.jpg', { type: blob.type });

            // Create a FormData object and append the File object
            const formData = new FormData();
            formData.append('file', file);
            formData.append('accessKey', accessKey);
            

            // Send the FormData to the decoding endpoint
            const res = await fetch("http://localhost:5000/decode", {
                method: "POST",
                body: formData,
            });

            // Parse the response from the decoding endpoint
            const data = await res.json();
            setDecodedData(data.hidden_data);
        } catch (error) {
            console.error('Error decoding image:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Grid container justifyContent="center" alignItems="center" style={{ minHeight: "100vh" }}>
            <Grid item xs={12} sm={6}>
                <Card>
                    <CardContent>
                        <img
                            width="100%"
                            height="auto"
                            alt="post"
                            src={`http://localhost:3001/assets/${imageUrl}`}
                        />
                        {decodedData && (
                            <Typography variant="body1">Decoded Data: {decodedData}</Typography>
                        )}
                    </CardContent>
                </Card>
            </Grid>
            {loading && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <CircularProgress />
                </div>
            )}
            <Grid item xs={12} style={{ marginTop: '1rem', textAlign: 'center' }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={decodeImage}
                    disabled={loading}
                >
                    {loading ? 'Decoding...' : 'Decode'}
                </Button>
            </Grid>
        </Grid>
    );
}

export default DecodePage;
