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

interface MathActivity {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  route: string;
}

const mathActivities: MathActivity[] = [
  {
    id: 'counting',
    title: 'Count Objects',
    subtitle: 'Learn to count 1 to 10',
    icon: '🍎',
    color: '#6BCB77',
    route: '/math/counting',
  },
  {
    id: 'addition',
    title: 'Add Together',
    subtitle: 'Combine groups with fun',
    icon: '➕',
    color: '#4D96FF',
    route: '/math/addition',
  },
  {
    id: 'subtraction',
    title: 'Take Away',
    subtitle: 'Visual minus & differences',
    icon: '➖',
    color: '#FF6B6B',
    route: '/math/subtraction',
  },
  {
    id: 'tracing',
    title: 'Write Numbers',
    subtitle: 'Trace numbers 1 to 10 with finger',
    icon: '✏️',
    color: '#9B59B6',
    route: '/math/tracing',
  },
];

export default function MathHubScreen() {
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
            <Text style={styles.headerBadge}>MATH ADVENTURE</Text>
            <Text style={styles.headerTitle}>Fun with Numbers</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {mathActivities.map((activity) => (
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
    color: '#6BCB77',
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
