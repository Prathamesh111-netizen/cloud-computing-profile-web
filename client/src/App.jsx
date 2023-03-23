import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import axios from "axios";

function App() {
  const [count, setCount] = useState(0);
  const [isUserCreated, setIsUserCreated] = useState(false);
  const [user, setUser] = useState({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [photo, setPhoto] = useState("");
  const [updateMode, setUpdateMode] = useState(false);

  const [isnewimagebeinguploaded, setIsNewImageBeingUploaded] = useState(false);

  const url = "https://profile-server-381518.el.r.appspot.com/users";

  const createuser = async () => {
    console.log("create user");
    // convert photo to base64 string using FileReader
    const reader = new FileReader();
    let base64String = "";
    reader.readAsDataURL(photo);
    reader.onload = () => {
      // console.log(reader.result);
      base64String = reader.result;
      axios
        .post(url, {
          name: name,
          email: email,
          password: password,
          image: base64String,
        })
        .then((res) => {
          const data = res.data;
          console.log(data);
          setUser(data);
          setIsUserCreated(true);
          getusers();

          setName("");
          setEmail("");
          setPassword("");
          setPhoto("");
        });
    };
    reader.onerror = (error) => {
      console.log("Error: ", error);
    };
  };

  const [users, setUsers] = useState(null);
  const getusers = async () => {
    console.log("get users");
    axios
      .get(url)
      .then((res) => {
        const data = res.data;
        console.log(data);
        setUsers(data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getusers();
  }, []);

  const deleteuser = async (email) => {
    console.log("delete user");
    axios
      .delete(`${url}/${email}`)
      .then((res) => {
        const data = res.data;
        console.log(data);
        getusers();
        // window.location.reload();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const updateusermodeon = async (email, name, password, image) => {
    console.log("update user");
    setUpdateMode(true);
    setName(name);
    setEmail(email);
    setPassword(password);
    setPhoto(image);
  };

  const updateUser = async () => {
    console.log("update user");

    if (isnewimagebeinguploaded) {
      const reader = new FileReader();
      let base64String = "";
      reader.readAsDataURL(photo);

      reader.onload = () => {
        base64String = reader.result;

        axios
          .put(url, {
            name: name,
            email: email,
            password: password,
            image: base64String,
          })
          .then((res) => {
            const data = res.data;
            console.log(data);
            setUser(data);
            getusers();
            setUpdateMode(false);
            setName("");
            setEmail("");
            setPassword("");
            setPhoto("");
          });

        reader.onerror = (error) => {
          console.log("Error: ", error);
        };
      };
    } else {
      console.log("no new image");
      console.log({
        name: name,
        // email: email,
        password: password,
      })
      axios
        .put(url, {
          name: name,
          email: email,
          password: password,
          image: null,
        })
        .then((res) => {
          const data = res.data;
          console.log(data);
          setUser(data);
          getusers();
          setUpdateMode(false);
          setIsNewImageBeingUploaded(false);
          setName("");
          setEmail("");
          setPassword("");
          setPhoto("");
        });
    }
  };

  const allusers = () => {
    return (
      <div className="users">
        {users.map((user) => {
          return (
            <div className="user" key={user.email}>
              <img src={user.image} alt="user" className="user-image" />
              <div className="user-details">
                <h3>{user.name}</h3>
                <p >{user.email}</p>
              </div>
              <div>
                <button
                  onClick={() =>
                    updateusermodeon(
                      user.email,
                      user.name,
                      user.password,
                      user.image
                    )
                  }
                  className="edit"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteuser(user.email)}
                  className="delete"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="App">
      {users && allusers()}

      {/* vertical line here */}
      <div className="vl"></div>

      {
        <div>
          <h1>{!updateMode && "create new one!"}</h1>
          <h1>{updateMode && "Update the user!"}</h1>
          <div className="input-form">
            {/* take user, name, email, password, photo as input to create user */}
            <input
              type="text"
              placeholder="name"
              onChange={(e) => setName(e.target.value)}
              value={name}
              className="name"
            />
            <input
              type="text"
              placeholder="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="email"
              disabled={updateMode}
            />
            <input
              type="text"
              placeholder="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="password"

            />
            {/* display uploaded image */}
            {photo && (
              <img
                src={
                  updateMode
                    ? isnewimagebeinguploaded
                      ? URL.createObjectURL(photo)
                      : photo
                    : URL.createObjectURL(photo)
                }
                alt="uploaded"
                className="imagepreview"
              />
            )}

            <input
              type="file"
              onChange={(e) => {
                setPhoto(e.target.files[0]);
                if (updateMode) {
                  setIsNewImageBeingUploaded(true);
                }
              }}
              className="photo"
            />
            {!updateMode && (
              <button onClick={() => createuser()} className="create">
                Create User
              </button>
            )}
            {updateMode && (
              <button onClick={() => updateUser()} className="update">
                Update User
              </button>
            )}
          </div>
        </div>
      }
    </div>
  );
}

export default App;
