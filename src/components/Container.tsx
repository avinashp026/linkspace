import { ReactNode } from "react"

type ContainerProps = {
    children: ReactNode;
}
const Container = ({children}: ContainerProps) => {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-24 py-1 md:py-2">
        {children}
    </div>
  )
}

export default Container