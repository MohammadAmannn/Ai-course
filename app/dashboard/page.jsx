"use client"
import React from 'react'
import _Addcourse from './_Dashboard_Components/AddCourse'
import { useUser } from '@clerk/nextjs'
function Dashboard() {
  return (
    <div>
      <_Addcourse/>
      </div>
  )
}

export default Dashboard