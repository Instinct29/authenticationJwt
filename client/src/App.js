import { useState, useEffect } from 'react';
import './App.css';
import Axios from 'axios';

function App() {
 
  const[userNameReg, setUserNameReg] = useState("");
  const[passwordReg, setPasswordReg] = useState("");

  const[userName, setUserName] = useState("");
  const[password, setPassword] = useState("");

  const[status, setStatus] = useState(false)

  Axios.defaults.withCredentials = true;
   
  const register = ()=>{
    Axios.post('http://localhost:3001/register', {username:userNameReg, password:passwordReg}).then((res)=>{
      console.log(res);
    })
  }

  const login = ()=>{
    Axios.post('http://localhost:3001/login', {username:userName, password:password}).then((res)=>{
      if(!res.data.auth){
        setStatus(false)
      } else{
        localStorage.setItem("token", res.data.token)
         setStatus(true) // comment new

      }
    })
  };

  useEffect(()=>{
      Axios.get("http://localhost:3001/login").then((response)=>{
        if(response.data.loggedIn == true){
          setStatus(response.data.user[0].username)
        }
      })
  },[])


  const userAuthenticated = () => {
    Axios.get("http://localhost:3001/isUserAuth", {headers : {
           "x-access-token": localStorage.getItem("token")
    }}).then((response)=>{
      console.log(response)
    })
  }

  return (
    <div className="App">


     <h2>Registration-</h2>
     <div className='form'>
       <label>Username</label>
       <input type="text" name='username' placeholder='Username/Email.......' onChange={(e)=> setUserNameReg(e.target.value)}/>
       <label>Password</label>
       <input type="password" name='password' placeholder='password.....' onChange={(e)=> setPasswordReg(e.target.value)}/>
       <button onClick={register}>Register</button>
     </div>

     <h2>Login-</h2>
     <div className='form'>
       <label>Username</label>
       <input type="text" name='username' placeholder='Username/Email here.....' onChange={(e)=> setUserName(e.target.value)} />
       <label>Password</label>
       <input type="text" name='password' placeholder='Enter password here....' onChange={(e)=> setPassword(e.target.value)}/>
       <button onClick={login}>Login</button>
     </div>


     {status &&  <button onClick={userAuthenticated}>Check Authentication</button>  }

 
    </div>
  );
}

export default App;
