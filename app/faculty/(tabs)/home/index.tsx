import { Redirect } from 'expo-router';

const index = () => {

  // const { data: subjectsStructure, isLoading, error } = useGetSubjectsStructure();

  // const router = useRouter();

  // // Check if loading or error
  // if (isLoading) return <Text>Loading...</Text>;
  // if (error) return <Text>Error loading data</Text>;

  // const departments = Object.keys(subjectsStructure.ldce);

  // //@ts-ignore
  // const renderDepartmentCard = ({ item }) => (
  //   <TouchableOpacity
  //     className="bg-white p-4 rounded-lg shadow-md my-2"
  //   onPress={() => router.push(`/faculty/home/department/${item}`)}
  //   >
  //     <Text className="text-lg font-semibold text-gray-800 capitalize">{item}</Text>
  //   </TouchableOpacity>
  // );

  return (
    // <View className="flex justify-center items-center bg-gray-100">
    //   <FlatList
    //     data={departments}
    //     keyExtractor={(item) => item}
    //     renderItem={renderDepartmentCard}
    //     contentContainerStyle={{ padding: 16 }}
    //     className='w-full'
    //   />
    // </View>
    <Redirect href={"/faculty/home/department/engineering"} />
  )
}

export default index