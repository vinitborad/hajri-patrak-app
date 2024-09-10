import { Redirect } from 'expo-router';

const index = () => {

  return (
    <Redirect href={"/faculty/home/department/engineering"} />
  )
}

export default index