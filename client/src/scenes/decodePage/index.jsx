import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { IconButton } from "@mui/material";

const DecodePage = () => {
    const { imageUrl } = useParams();
    const [decodedData, setDecodedData] = useState("");

    const decodeImage = async () => {
        try {
            // Fetch the image from the URL
            const response = await fetch(`http://localhost:3001/assets/${imageUrl}`);
            const blob = await response.blob();

            // Create a File object from the Blob with a custom filename (optional)
            const file = new File([blob], 'image.jpg', { type: blob.type });

            // Create a FormData object and append the File object
            const formData = new FormData();
            formData.append('file', file);

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
        }
    };

    return (
        <div>
            <img src={`http://localhost:3001/assets/${imageUrl}`} alt="Destination" />
            <IconButton onClick={decodeImage}>
                Decode
            </IconButton>
            <p>Decoded Data : {decodedData}</p>
        </div>
    );
}

export default DecodePage;
