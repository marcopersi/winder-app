import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

interface AccordionProps {
  children: React.ReactElement<AccordionItemProps>[];
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
}

interface AccordionItemProps {
  value: string;
  title: string;
  children: React.ReactNode;
  isExpanded?: boolean;
  onToggle?: (value: string) => void;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  value,
  title,
  children,
  isExpanded = true, // Default to expanded
  onToggle,
}) => {
  const [animation] = useState(new Animated.Value(1)); // Start expanded

  React.useEffect(() => {
    Animated.timing(animation, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isExpanded, animation]);

  const handlePress = () => {
    onToggle?.(value);
  };

  const rotateIcon = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.accordionItem}>
      <TouchableOpacity style={styles.header} onPress={handlePress}>
        <Text style={styles.title}>{title}</Text>
        <Animated.Text style={[styles.chevron, { transform: [{ rotate: rotateIcon }] }]}>
          ▼
        </Animated.Text>
      </TouchableOpacity>
      {/* ALWAYS render content - no maxHeight constraint */}
      <View style={[styles.content, isExpanded ? {} : { height: 0, overflow: 'hidden' }]}>
        <View style={styles.contentInner}>
          {children || null}
        </View>
      </View>
    </View>
  );
};

export const Accordion: React.FC<AccordionProps> = ({
  children,
  type = 'multiple',
  defaultValue = [],
}) => {
  // Start with ALL items expanded by default
  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    const childValues = React.Children.map(children, child => child.props.value) || [];
    return childValues; // All expanded by default
  });

  const handleToggle = (value: string) => {
    if (type === 'single') {
      setExpandedItems(expandedItems.includes(value) ? [] : [value]);
    } else {
      setExpandedItems(prev =>
        prev.includes(value)
          ? prev.filter(item => item !== value)
          : [...prev, value]
      );
    }
  };

  return (
    <View style={styles.accordion}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          isExpanded: expandedItems.includes(child.props.value),
          onToggle: handleToggle,
        })
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  accordion: {
    flex: 1,
  },
  accordionItem: {
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(114, 28, 36, 0.05)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(114, 28, 36, 0.1)',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#721c24',
    flex: 1,
  },
  chevron: {
    fontSize: 12,
    color: '#721c24',
    fontWeight: 'bold',
  },
  content: {
    overflow: 'hidden',
  },
  contentInner: {
    padding: 20,
  },
});