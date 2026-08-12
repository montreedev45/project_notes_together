import { GoogleLogin } from '@react-oauth/google';
import useAuthStore from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

function GoogleAuthButton() {
  const navigate = useNavigate()
  const googleLogin = useAuthStore((state) => state.googleLogin);

  const handleSuccess = async (credentialResponse) => {
    // credentialResponse.credential คือ Google ID Token (JWT)
    try {
      const res = await googleLogin(credentialResponse.credential);
      if(res.success === true){
        navigate("/notes-together/explore");
      }
      
    } catch (error) {
      console.error('Google Sign-In Error:', error);
    }
  };

  const handleError = () => {
    console.error('Login Failed');
  };

  return (
    <div className="flex justify-center my-4">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={false}
      />
    </div>
  );
}

export default GoogleAuthButton;