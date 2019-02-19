import * as React from "react";
import { Alert, StyleSheet, Text, View, Clipboard } from "react-native";
import { textStyle as makeTextStyle } from "Urbi/utils/textStyles";
import { colors } from "Urbi/utils/colors";
import { Font, Linking, AppLoading } from "expo";
import Button from "Urbi/molecules/buttons/Button";
import {
  height,
  horizontalPadding,
  maxWidth,
  minWidth
} from "Urbi/molecules/buttons/ButtonPrimary";

const caBaseUrl = "https://urbitunnel.eu.ngrok.io";

type State = {
  fontsLoaded: boolean;
  shownSplash: boolean;
  walletResponse: string;
};

export default class App extends React.Component<{}, State> {
  constructor(props: any) {
    super(props);
    this.state = { fontsLoaded: false, shownSplash: false, walletResponse: "" };
    setTimeout(() => this.setState({ shownSplash: true }), 1500);

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
    const { fontsLoaded, shownSplash, walletResponse } = this.state;
    if (!fontsLoaded || !shownSplash)
      return <AppLoading onError={console.warn} />;
    const responseFetched = walletResponse.length > 2;
    return (
      <View style={styles.Container}>
        <Text style={styles.Title}>Welcome to BobCars!</Text>
        <View style={styles.ActionButton}>
          {responseFetched ? (
            <Text style={styles.Info}>Data fetched from Urbi 👌</Text>
          ) : null}
          <Button
            label={responseFetched ? "Sign up" : "Get data from urbi"}
            backgroundColor={colors.ulisse}
            color={colors.brand}
            height={height}
            horizontalPadding={horizontalPadding}
            maxWidth={maxWidth}
            minWidth={minWidth}
            textStyle="bodyBold"
            isUppercase
            onPress={this.onSubmit}
          />
        </View>
        {responseFetched ? (
          <View style={styles.SecondaryButton}>
            <Button
              label="View data"
              backgroundColor={colors.transparent}
              color={colors.ulisse}
              height={height}
              horizontalPadding={horizontalPadding}
              maxWidth={maxWidth}
              minWidth={minWidth}
              textStyle="bodyBold"
              isUppercase={false}
              onPress={this.onView}
            />
          </View>
        ) : null}
        {responseFetched ? (
          <View style={styles.SecondaryButton}>
            <Button
              label="Reset data"
              backgroundColor={colors.transparent}
              color={colors.ulisse}
              height={height}
              horizontalPadding={horizontalPadding}
              maxWidth={maxWidth}
              minWidth={minWidth}
              textStyle="bodyBold"
              isUppercase={false}
              onPress={this.onReset}
            />
          </View>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: "rgb(174, 1, 109)",
    alignItems: "center",
    justifyContent: "center"
  },
  Title: {
    ...makeTextStyle("hero", colors.ulisse)
  },
  Info: {
    ...makeTextStyle("title", colors.ulisse),
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
