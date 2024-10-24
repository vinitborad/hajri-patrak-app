import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

export const CustomCheckBox = ({ value, onValueChange }: { value: boolean; onValueChange: () => void }) => {
  return (
    <TouchableOpacity
      onPress={onValueChange}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Ionicons
        name={value ? 'checkbox-outline' : 'square-outline'}
        size={24}
        color={value ? '#9DBDFF' : '#9DBDFF'}
      />
    </TouchableOpacity>
  );
};