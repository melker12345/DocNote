import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as MediaLibrary from 'expo-media-library';

const { width, height } = Dimensions.get('window');

const CameraScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [isTextVisible, setIsTextVisible] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();
      if (!permission?.granted) {
        await requestPermission();
      }
    })();
  }, [permission, requestPermission]);

  const captureAndProcessImage = async () => {
    if (!cameraRef.current) return;

    try {
      setIsProcessing(true);
      
      // Capture the image
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      // For now, we'll simulate OCR processing
      // In a real implementation, you would use react-native-text-recognition
      // or @react-native-ml-kit/text-recognition here
      await simulateOCR(photo);
      
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'Failed to capture image');
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateOCR = async (photo) => {
    // Simulate OCR processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulated extracted text - in real app, this would come from OCR
    const mockText = `This is a sample document text that would be extracted from the image using OCR technology. 

The document contains important information about various topics including business processes, technical specifications, and other relevant details that need to be summarized.

This text would normally be extracted in real-time from the camera feed using ML Kit or similar OCR technology.`;

    setRecognizedText(mockText);
    setIsTextVisible(true);
  };

  const processSummary = async (summaryLength) => {
    if (!recognizedText.trim()) {
      Alert.alert('Error', 'No text found to summarize');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Simulate AI summarization based on length
      const summary = await generateSummary(recognizedText, summaryLength);
      const title = await generateTitle(recognizedText);
      
      // Create new note
      const newNote = {
        id: Date.now().toString(),
        title: title,
        summary: summary,
        fullText: recognizedText,
        createdAt: new Date().toISOString(),
      };

      // Save to storage
      const existingNotes = await AsyncStorage.getItem('notes');
      const notes = existingNotes ? JSON.parse(existingNotes) : [];
      notes.unshift(newNote);
      await AsyncStorage.setItem('notes', JSON.stringify(notes));

      // Navigate back to home
      navigation.navigate('Home');
      
    } catch (error) {
      console.error('Error processing summary:', error);
      Alert.alert('Error', 'Failed to process summary');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateSummary = async (text, length) => {
    // Simulate AI summarization - in real app, this would call an AI service
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const summaries = {
      short: text.substring(0, 100) + '...',
      medium: text.substring(0, 200) + '...',
      large: text.substring(0, 300) + '...',
    };
    
    return summaries[length] || summaries.medium;
  };

  const generateTitle = async (text) => {
    // Simulate AI title generation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const words = text.split(' ').slice(0, 5);
    return words.join(' ').replace(/[^\w\s]/gi, '') + '...';
  };

  const showSummaryOptions = () => {
    Alert.alert(
      'Choose Summary Length',
      'How detailed would you like the summary to be?',
      [
        { text: 'Short', onPress: () => processSummary('short') },
        { text: 'Medium', onPress: () => processSummary('medium') },
        { text: 'Large', onPress: () => processSummary('large') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No access to camera</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        style={styles.camera}
        facing='back'
        ref={cameraRef}
      >
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Scan Document</Text>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setIsTextVisible(!isTextVisible)}
            >
              <Ionicons 
                name={isTextVisible ? "eye-off" : "eye"} 
                size={24} 
                color="white" 
              />
            </TouchableOpacity>
          </View>

          {/* Document frame guide */}
          <View style={styles.frameGuide}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>

          {/* Real-time text overlay */}
          {isTextVisible && recognizedText && (
            <View style={styles.textOverlay}>
              <Text style={styles.overlayText} numberOfLines={5}>
                {recognizedText}
              </Text>
            </View>
          )}

          {/* Bottom controls */}
          <View style={styles.controls}>
            <Text style={styles.instructionText}>
              Position document within the frame
            </Text>
            
            {isProcessing ? (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="large" color="white" />
                <Text style={styles.processingText}>Processing...</Text>
              </View>
            ) : (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={captureAndProcessImage}
                >
                  <Ionicons name="camera" size={30} color="white" />
                </TouchableOpacity>
                
                {recognizedText && (
                  <TouchableOpacity
                    style={styles.doneButton}
                    onPress={showSummaryOptions}
                  >
                    <Ionicons name="checkmark" size={24} color="white" />
                    <Text style={styles.doneButtonText}>Done</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </CameraView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  frameGuide: {
    position: 'absolute',
    top: height * 0.2,
    left: width * 0.1,
    right: width * 0.1,
    bottom: height * 0.4,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: 'white',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  textOverlay: {
    position: 'absolute',
    bottom: 200,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 10,
  },
  overlayText: {
    color: 'white',
    fontSize: 12,
    lineHeight: 16,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginLeft: 20,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
  processingContainer: {
    alignItems: 'center',
  },
  processingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default CameraScreen;
