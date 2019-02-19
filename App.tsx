import * as React from "react";
import { Alert, StyleSheet, Text, View, Clipboard } from "react-native";
import { textStyle as makeTextStyle } from "Urbi/utils/textStyles";
import { colors } from "Urbi/utils/colors";
import { Font, Linking } from "expo";
import ButtonPrimary from "Urbi/molecules/buttons/ButtonPrimary";
import ButtonSecondary from "./Urbi/molecules/buttons/ButtonSecondary";

const caBaseUrl = "https://urbitunnel.eu.ngrok.io";

type State = {
  fontsLoaded: boolean;
  walletResponse: string;
};

export default class App extends React.Component<{}, State> {
  constructor(props: any) {
    super(props);
    this.state = { fontsLoaded: false, walletResponse: "" };
    this.onSubmit = this.onSubmit.bind(this);
    this.onReset = this.onReset.bind(this);
    this.onView = this.onView.bind(this);
    this.onCopy = this.onCopy.bind(this);

    Linking.addEventListener("url", info => {
      if (info) {
        const { queryParams } = Linking.parse(info.url);
        if (queryParams.payload) {
          this.setState({ walletResponse: queryParams.payload });
        }
      }
    });

    Linking.parseInitialURLAsync().then(info => {
      if (info.queryParams.payload) {
        this.setState({ walletResponse: info.queryParams.payload });
      }
    });
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
  }

  async onSubmit() {
    const { walletResponse } = this.state;
    if (walletResponse.length > 2) {
      const response = await fetch(`${caBaseUrl}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: walletResponse
      });
      if (response.status !== 200) {
        window.alert(`Our server sent us back a code ${response.status}`);
      } else {
        const json = await response.json();
        window.alert(`Response from server:\n${JSON.stringify(json)}`);
      }
    } else {
      const callback = encodeURIComponent(Linking.makeUrl("callback"));
      // standalone app:                 const url = `urbiwallet://consent/bobcars/${callback}`;
      // dev app (expo - adjust port):   const url = `exp://192.168.2.184:19004/--/consent/bobcars/${callback}`;
      // published (expo):               const url = `exp://exp.host/@michele.bon/urbi-wallet/--/consent/bobcars/${callback}`;
      const url = `exp://exp.host/@michele.bon/urbi-wallet/--/consent/bobcars/${callback}`;
      Linking.openURL(url);
    }
  }

  onReset() {
    this.setState({ walletResponse: "" });
  }

  onCopy() {
    Clipboard.setString(this.state.walletResponse);
  }

  onView() {
    Alert.alert("Data from Urbi", this.state.walletResponse, [
      { text: "Copy", onPress: this.onCopy },
      { text: "Ok" }
    ]);
  }

  render() {
    const { fontsLoaded, walletResponse } = this.state;
    if (!fontsLoaded) return null;
    const responseFetched = walletResponse.length > 2;
    return (
      <View style={styles.Container}>
        <Text style={styles.Title}>Welcome to BobCars!</Text>
        <View style={styles.ActionButton}>
          {responseFetched ? (
            <Text style={styles.Info}>Data fetched from Urbi 👌</Text>
          ) : null}
          <ButtonPrimary
            label={responseFetched ? "Sign up" : "Get data from urbi"}
            onPress={this.onSubmit}
          />
        </View>
        {responseFetched ? (
          <View style={styles.SecondaryButton}>
            <ButtonSecondary label="View data" onPress={this.onView} />
          </View>
        ) : null}
        {responseFetched ? (
          <View style={styles.SecondaryButton}>
            <ButtonSecondary label="Reset data" onPress={this.onReset} />
          </View>
        ) : null}
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
  Info: {
    ...makeTextStyle("title", colors.uma),
    textAlign: "center",
    marginBottom: 10
  },
  ActionButton: {
    padding: 20
  },
  SecondaryButton: {
    padding: 2
  }
});
