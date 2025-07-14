import { Link } from "react-router-dom";
import { ChevronRightIcon } from "@heroicons/react/24/outline"; 
const MenuItem = ({to, text}) => {
  return (
    <li>
    <Link to={to} className="flex items-center justify-between text-gray-400 hover:underline">
      {text}
      <ChevronRightIcon className="h-4 w-4" />
    </Link>
  </li>
  )
}

export default MenuItem