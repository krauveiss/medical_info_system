import './style.css'

import React from 'react'

import AppNavbar from './AppNavbar'

interface Props {
  children: React.ReactNode
}

const MainLayout = ({ children }: Props) => {
  return (
    <>
      <AppNavbar></AppNavbar>
      {children}
    </>
  )
}

export default MainLayout
