import * as React from "react";
import { Alert, StyleSheet, Text, View, Clipboard } from "react-native";
import { textStyle as makeTextStyle } from "Urbi/utils/textStyles";
import { colors } from "Urbi/utils/colors";
import { Font, Linking, AppLoading } from "expo";
import Spinner from "react-native-loading-spinner-overlay";
import Button from "Urbi/molecules/buttons/Button";
import {
  height,
  horizontalPadding,
  maxWidth,
  minWidth
} from "Urbi/molecules/buttons/ButtonPrimary";

const caBaseUrl = "https://token.urbi.co";

type State = {
  fontsLoaded: boolean;
  shownSplash: boolean;
  showSpinner: boolean;
  walletResponse: string;
};

const alert = (msg: string) => setTimeout(() => window.alert(msg), 250);

export default class App extends React.Component<{}, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      fontsLoaded: false,
      shownSplash: false,
      showSpinner: false,
      walletResponse: ""
    };
    setTimeout(() => this.setState({ shownSplash: true }), 1500);

    this.onSubmit = this.onSubmit.bind(this);
    this.onReset = this.onReset.bind(this);
    this.onView = this.onView.bind(this);
    this.onCopy = this.onCopy.bind(this);

    Linking.addEventListener("url", info => {
      if (info) {
        const { queryParams } = Linking.parse(info.url);
        if (queryParams.payload) {
          this.signup(queryParams.payload);
        }
      }
    });

    Linking.parseInitialURLAsync().then(info => {
      if (info.queryParams.payload) {
        this.signup(info.queryParams.payload);
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

  async signup(walletResponse: string) {
    this.setState({
      showSpinner: true,
      walletResponse
    });

    const response = await fetch(`${caBaseUrl}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: walletResponse
    });

    if (response.status !== 200) {
      alert(`Our server sent us back a code ${response.status}`);
    } else {
      const json = await response.json();
      console.log(`Response from server:\n${JSON.stringify(json)}`);
      setTimeout(() => this.setState({ showSpinner: false }), 2500);
    }
  }

  async onSubmit() {
    // depending on the env, urbi wallet could be reached at one of these urls:
    // standalone app:                 urbiwallet://consent/bobcars/${callback}
    // dev app (expo - adjust port):   exp://192.168.2.184:19004/--/consent/bobcars/${callback}
    // published (expo):               exp://exp.host/@michele.bon/urbi-wallet/--/consent/bobcars/${callback}
    const callback = Linking.makeUrl("callback");
    let prefix = callback.substring(0, callback.indexOf("callback"));

    // if we're running on dev, we need to contact the wallet on the other port
    // (we assume here that the 2 apps are served on ports 19000 -- the default -- and 19004 -- the next available)
    const match = /exp:\/\/[^:\/]+:(\d+)/.exec(prefix);
    const port = match && match[1];
    if (port) {
      if (port === "19000") {
        prefix = prefix.replace(port, "19004");
      } else {
        prefix = prefix.replace(port, "19000");
      }
    } else if (prefix.indexOf("BobCars")) {
      // app is published on expo, prefix is exp://exp.host/@michele.bon/BobCars/--/
      prefix = prefix.replace("BobCars", "urbi-wallet");
    }
    const url = `${prefix}consent/bobcars/${encodeURIComponent(callback)}`;
    console.log(`opening ${url}`);
    Linking.openURL(url);
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
    const {
      fontsLoaded,
      shownSplash,
      showSpinner,
      walletResponse
    } = this.state;
    if (!fontsLoaded || !shownSplash)
      return <AppLoading onError={console.warn} />;
    const responseFetched = walletResponse.length > 2;

    return (
      <View style={styles.Container}>
        <Spinner
          visible={showSpinner}
          textContent="Signing up..."
          textStyle={styles.Spinner}
          color={colors.primary}
          overlayColor="rgba(0, 0, 0, 0.75)"
        />
        <Text style={styles.Title}>Welcome to BobCars!</Text>
        <View style={styles.ActionButton}>
          {responseFetched ? (
            <Text style={styles.Info}>
              Nice to see you, {JSON.parse(walletResponse).payload.firstName}!
              👋
            </Text>
          ) : null}
          <Button
            label={responseFetched ? "View data" : "Login with Urbi Wallet"}
            backgroundColor={colors.ulisse}
            color={colors.brand}
            height={height}
            horizontalPadding={horizontalPadding}
            maxWidth={maxWidth}
            minWidth={minWidth}
            textStyle="bodyBold"
            isUppercase
            onPress={responseFetched ? this.onView : this.onSubmit}
          />
        </View>
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
  },
  Spinner: {
    ...makeTextStyle("title", colors.ulisse),
    fontSize: 22,
    textAlign: "center"
  }
});
