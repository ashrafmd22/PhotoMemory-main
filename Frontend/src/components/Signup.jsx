import React, { useState } from 'react'
import { Link, NavLink } from "react-router-dom";
import './signup.css'
function Signup() {
    const [email,setemail]=useState("");
    const [password,setpass]=useState("");
    const [username,setUsername]=useState("");

    async function signupUser(event){
        event.preventDefault();
        const response= await fetch('http://localhost:8000/api/v1/users/register',{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
            },
            body:JSON.stringify({
                username,
                email,
                password,
            }),
        }
        )
        const data= await response.json();
        console.log(data);
    }

  return (
    <div className='signpage'>
    <div className='flex justify-end'>
    <NavLink
          to="/login"
          className="p-3 bg-slate-900 text-white">
            Login
    </NavLink>
    </div>
    <div className="blureffect flex min-h-full flex-1 flex-col justify-center px-6 py-8 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-4xl font-bold leading-9 tracking-tight text-black">
            Sign Up
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={signupUser}>
          <div className='input_box'>
              <label htmlFor="text" className="block text-sm font-medium leading-6 text-gray-900">
                Username
              </label>
                <input
                  id="createusername"
                  name="text"
                  type="text"
                  autoComplete="email"
                  value={username}
                  onChange={(e)=>setUsername(e.target.value)}
                  required
                  className=" w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
            </div>
            <div className='input_box'>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Email address
              </label>
                <input
                  id="createemail"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e)=>setemail(e.target.value)}
                  required
                  className=" w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
            </div>

            <div className='input_box'>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                  Password
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="createpassword"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e)=>setpass(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign Up
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Signup