import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';

interface LogicActivity {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  route: string;
}

const logicActivities: LogicActivity[] = [
  {
    id: 'matching',
    title: 'Picture Match',
    subtitle: 'Find the identical picture',
    icon: '🐶',
    color: '#54a0ff',
    route: '/logic/matching',
  },
  {
    id: 'odd-one-out',
    title: 'Odd One Out',
    subtitle: 'Which item does not belong?',
    icon: '🧐',
    color: '#ff9f43',
    route: '/logic/odd-one-out',
  },
  {
    id: 'patterns',
    title: 'What Comes Next?',
    subtitle: 'Complete the fun sequence',
    icon: '🧩',
    color: '#5f27cd',
    route: '/logic/patterns',
  },
  {
    id: 'sorting',
    title: 'Sort the Items',
    subtitle: 'Organize food, animals & vehicles',
    icon: '🧺',
    color: '#00D2D3',
    route: '/logic/sorting',
  },
];

export default function LogicHubScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF9F0" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.replace('/')}
            accessibilityRole="button"
            accessibilityLabel="Back to Home"
          >
            <Text style={styles.backBtnText}>⬅️</Text>
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.headerBadge}>LOGIC & THINKING</Text>
            <Text style={styles.headerTitle}>Puzzle Fun</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {logicActivities.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={[styles.card, { backgroundColor: activity.color }]}
              onPress={() => router.push(activity.route as any)}
              accessibilityRole="button"
              accessibilityLabel={activity.title}
            >
              <Text style={styles.cardIcon}>{activity.icon}</Text>
              <View style={styles.cardTextContent}>
                <Text style={styles.cardTitle}>{activity.title}</Text>
                <Text style={styles.cardSubtitle}>{activity.subtitle}</Text>
              </View>
              <Text style={styles.cardArrow}>➔</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF9F0',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  backBtnText: {
    fontSize: 20,
  },
  headerTitles: {
    alignItems: 'center',
  },
  headerBadge: {
    fontSize: 12,
    fontWeight: '900',
    color: '#5f27cd',
    letterSpacing: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2D3748',
  },
  listContent: {
    paddingVertical: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    borderWidth: 5,
    borderColor: '#FFFFFF',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  cardIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  cardTextContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  cardArrow: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '900',
  },
});
