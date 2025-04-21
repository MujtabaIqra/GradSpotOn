
import { useNavigate } from 'react-router-dom';
import HomePage from './HomePage';

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <HomePage />
  );
};

export default Index;
