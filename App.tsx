import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { textStyle as makeTextStyle } from "Urbi/utils/textStyles";
import { colors } from "Urbi/utils/colors";
import { Font, Linking } from "expo";
import ButtonPrimary from "Urbi/molecules/buttons/ButtonPrimary";

type AppState = {
  fontsLoaded: boolean;
};

export default class App extends React.Component<{}, AppState> {
  constructor(props: any) {
    super(props);
    this.state = { fontsLoaded: false };
    this.onSubmit = this.onSubmit.bind(this);
  }

  async componentDidMount() {
    await Font.loadAsync({
      Barlow: require("./assets/fonts/Barlow-Regular.ttf"),
      "Barlow-Regular": require("./assets/fonts/Barlow-Regular.ttf"),
      "Barlow-Medium": require("./assets/fonts/Barlow-Medium.ttf"),
      "Barlow-Bold": require("./assets/fonts/Barlow-Bold.ttf"),
      "Barlow-ExtraBold": require("./assets/fonts/Barlow-ExtraBold.ttf")
    });
    this.setState({ fontsLoaded: true });
    Linking.parseInitialURLAsync().then(info => {
      window.alert(
        `path: ${info.path}, query: ${JSON.stringify(info.queryParams)}`
      );
    });
  }

  shouldComponentUpdate() {
    console.log("should it?");
    return true;
  }

  onSubmit() {
    const callback = encodeURIComponent(Linking.makeUrl("callback"));
    // const url = `urbiwallet://consent/bobcars/${callback}`;
    const url = `exp://192.168.0.12:19000/--/consent/bobcars/${callback}`;
    Linking.openURL(url);
  }

  render() {
    if (!this.state.fontsLoaded) return null;
    return (
      <View style={styles.Container}>
        <Text style={styles.Title}>Welcome to BobCars!</Text>
        <View style={styles.BottomButton}>
          <ButtonPrimary label="Get data from urbi!" onPress={this.onSubmit} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  },
  Title: {
    ...makeTextStyle("hero", colors.brand)
  },
  BottomButton: {
    padding: 20
  }
});
