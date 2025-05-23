import { SafeAreaView, Text } from 'react-native';
import { Appbar } from 'react-native-paper';



export default function ExploreScreen(){
  return(
    <>
      <Appbar.Header>
        <Appbar.Content title="Groups" />
      </Appbar.Header>
      <SafeAreaView>
        <Text>Explore</Text>
      </SafeAreaView>
    </>
  )
}