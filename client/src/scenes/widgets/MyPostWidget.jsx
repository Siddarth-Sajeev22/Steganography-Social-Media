import {
  EditOutlined,
  DeleteOutlined,
  AttachFileOutlined,
  GifBoxOutlined,
  ImageOutlined,
  MicOutlined,
  MoreHorizOutlined,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  Typography,
  InputBase,
  useTheme,
  Button,
  IconButton,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox
} from "@mui/material";
import FlexBetween from "components/FlexBetween";
import Dropzone from "react-dropzone";
import UserImage from "components/UserImage";
import WidgetWrapper from "components/WidgetWrapper";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "state";

const MyPostWidget = ({ picturePath }) => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [encodedImage, setEncodedImage] = useState('');
  const [isImage, setIsImage] = useState(false);
  const [image, setImage] = useState(null);
  const [post, setPost] = useState("");
  const { palette } = useTheme();
  const { _id } = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  const mediumMain = palette.neutral.mediumMain;
  const medium = palette.neutral.medium;
  const [friends, setFriends] = useState([]);
  const [showFriendsList, setShowFriendsList] = useState(false); // State to control visibility of friends list
  const [hiddenData,setHidden]=useState("");
  useEffect(() => {
    console.log(friends);
  }, [friends]);
  useEffect(() => {
    console.log(selectedFriends);
  }, [selectedFriends]);
 
  const handleTag = async () => {
    try {
      const response = await fetch(`http://localhost:3001/users/${_id}/friends`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setFriends(data);
      setShowFriendsList(true); // Set showFriendsList to true when friends are fetched
      setOpen(true);
    } catch (error) {
      console.error('Error fetching friend details:', error);
    }
  };

  const handleFriendToggle = (friendId) => (event) => {
    const isChecked = event.target.checked;
    setSelectedFriends((prevSelected) => {
      if (isChecked) {
        return [...prevSelected, friendId]; // Add friendId to the array
      } else {
        return prevSelected.filter((id) => id !== friendId); // Remove friendId from the array
      }
    });
  };
  

  const handleTagAction = () => {
    // Perform tagging action here using selectedFriends
    console.log("Selected Friends:", selectedFriends);
    setOpen(false);
  };

const handlePost = async () => {
  const formData = new FormData();
  formData.append("userId", _id);
  formData.append("description", post);
  formData.append("taggedUsers", JSON.stringify(selectedFriends));

  if (image) {
    // Perform steganography encoding on the image before uploading
    const stegoImage = await encodeImage(image);
    formData.append("picturePath", stegoImage.stego_image);
    formData.append("accessKey", stegoImage.access_key);
  }
  
  const response = await fetch(`http://localhost:3001/posts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  
  const posts = await response.json();
  dispatch(setPosts({ posts }));
  setImage(null);
  setPost("");
  setHidden("");
};

const encodeImage = async (image, ) => {
  const formData = new FormData();
  formData.append("file", image);
  formData.append("data", hiddenData );
  console.log(image);   // Send the image to Flask server for steganography encoding
  const response = await fetch("http://localhost:5000/encode", {
    method: "POST",
    body: formData,
  });

  const a = await response.json();
  
  return a ;
};

  return (
    <WidgetWrapper>
      <FlexBetween gap="1.5rem">
        <UserImage image={picturePath} />
        <InputBase
          placeholder="What's on your mind..."
          onChange={(e) => setPost(e.target.value)}
          value={post}
          sx={{
            width: "100%",
            backgroundColor: palette.neutral.light,
            borderRadius: "2rem",
            padding: "1rem 2rem",
          }}
        />
        
      </FlexBetween>
      {isImage && (
        <Box
          border={`1px solid ${medium}`}
          borderRadius="5px"
          mt="1rem"
          p="1rem"
        >
          <Dropzone
            acceptedFiles=".jpg,.jpeg,.png"
            multiple={false}
            onDrop={(acceptedFiles) => setImage(acceptedFiles[0])}
          >
            {({ getRootProps, getInputProps }) => (
              <FlexBetween>
                <Box
                  {...getRootProps()}
                  border={`2px dashed ${palette.primary.main}`}
                  p="1rem"
                  width="100%"
                  sx={{ "&:hover": { cursor: "pointer" } }}
                >
                  <input {...getInputProps()} />
                  {!image ? (
                    <p>Add Image Here</p>
                  ) : (
                    <FlexBetween>
                      <Typography>{image.name}</Typography>
                      <EditOutlined />
                    </FlexBetween>
                  )}
                </Box>
                {image && (
                  <IconButton
                    onClick={() => setImage(null)}
                    sx={{ width: "15%" }}
                  >
                    <DeleteOutlined />
                  </IconButton>
                )}
              </FlexBetween>
            )}
          </Dropzone>
          <InputBase
          placeholder="Data to be hidden"
          onChange={(e) => setHidden(e.target.value)}
          value={hiddenData}
          sx={{
            marginTop:"2rem",
            width: "100%",
            backgroundColor: palette.neutral.light,
            borderRadius: "2rem",
            padding: "1rem 2rem",
          }}
        />
        </Box>
      )}

      <Divider sx={{ margin: "1.25rem 0" }} />

      <FlexBetween>
        <FlexBetween gap="0.25rem" onClick={() => setIsImage(!isImage)}>
          <ImageOutlined sx={{ color: mediumMain }} />
          <Typography
            color={mediumMain}
            sx={{ "&:hover": { cursor: "pointer", color: medium } }}
          >
            Image
          </Typography>
        </FlexBetween>

        {/* {friends.length >0 && ( // Conditionally render friends list only if showFriendsList is true
          <ul>
            {friends.map(friend => (
              <li key={friend.id}>{friend.firstName}</li>
            ))}
          </ul>
        )} */}

        <Button
          disabled={!post}
          onClick={handleTag}
          sx={{
            color: palette.background.alt,
            backgroundColor: palette.primary.main,
            borderRadius: "3rem",
          }}
        >
          Tag
        </Button>
        
        <Button
          disabled={!post}
          onClick={handlePost}
          sx={{
            color: palette.background.alt,
            backgroundColor: palette.primary.main,
            borderRadius: "3rem",
          }}
        >
          POST
        </Button>
      </FlexBetween>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Select Friends</DialogTitle>
        <DialogContent>
          {friends.map((friend) => (
            <FormControlLabel
              key={friend._id}
              control={
                <Checkbox
                  checked={selectedFriends.indexOf(friend._id) !== -1}
                  onChange={handleFriendToggle(friend._id)}
                />
              }
              label={friend.firstName}
            />
          ))}
          {friends.length === 0 && (
            <Typography>No friends available to tag.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleTagAction} variant="contained" color="primary">
            Tag
          </Button>
        </DialogActions>
      </Dialog>
    </WidgetWrapper>
  );
};

export default MyPostWidget;
