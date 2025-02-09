import { Layout } from 'antd'
import styled from 'styled-components'
import { MainPage } from './components/MainPage'

const StyledLayout = styled(Layout)`
  min-height: 100vh;
`

function App() {
  return (
    <StyledLayout>
      <MainPage />
    </StyledLayout>
  )
}

export default App
