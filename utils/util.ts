import { Dimensions } from "react-native"

export const getWindowWidth = () => {
  return Dimensions.get('window').width;
}

export const getWindowHeight = () => {
  return Dimensions.get('window').height;
}
