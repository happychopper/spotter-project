import { StackActions, NavigationActions } from 'react-navigation';

export function ResetNavigation(routeName, navigation) {
  const resetAction = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: routeName })],
  });
  navigation.dispatch(resetAction);
}