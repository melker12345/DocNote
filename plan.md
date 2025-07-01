
# Document Summary App Plan

## Notes
- The app will be built with React Native to support both iOS and Android.
- Users see an overview of all notes, each with a title, summary, and full text.
- Users can add new notes by capturing images with the back camera.
- OCR (text extraction) will be implemented using a reliable React Native module.
- OCR must support real-time text recognition from the live camera feed (not just static images).
- Future support for multi-page scanning (continuous reading) is planned.
- AI model will generate summaries and titles from scanned text.
- User experience should be seamless but can be refined later.
- The CameraView `facing` prop must use the string `'back'` (not `CameraType.back`) for compatibility with Expo SDK 53+.
- llama.rn (React Native binding for llama.cpp) is integrated for on-device AI summarization. See AIService.js for implementation details.
- Real OCR text extraction from captured images is not yet implemented; fallback/mock text is being used. User wants to see real extracted text in the note view.
- The nested DocNoteApp folder has been deleted; project structure is now clean and ready for native development build.
- User is now transitioning to a development build (expo-dev-client), enabling use of native OCR modules for offline OCR (e.g., @react-native-ml-kit/text-recognition).
- Native OCR modules (like ML Kit) do not work in Expo Go because Expo Go cannot load arbitrary native code; only development builds or production builds can include custom native modules.
- Next step: Set up Android SDK or Android Studio to enable building and testing the app with native OCR on a real device.

## Task List
- [x] Set up a new React Native project (Expo or CLI)
- [x] Scaffold main screens: Overview (Home), Add Note (Camera), Note Details
- [x] Implement navigation between screens
- [x] Integrate camera functionality (back camera only)
- [ ] Integrate OCR module for real-time text extraction from live camera feed
  - [ ] Implement OCR using native module (e.g., @react-native-ml-kit/text-recognition) for offline OCR
  - [ ] Ensure extracted text is stored and visible as full text in notes
- [x] Store notes locally (title, summary, full text)
- [x] Implement AI summarization (local or API-based, prompt for summary length)
- [x] Integrate llama.cpp for on-device AI summarization
- [ ] Display notes in overview with title, summary, and full text
- [ ] Add ability to add new note via camera and OCR
- [ ] Plan for future: multi-page scan workflow
- [ ] Polish UI/UX for seamless experience

## Current Goal
Integrate OCR module for real-time text extraction from live camera feed