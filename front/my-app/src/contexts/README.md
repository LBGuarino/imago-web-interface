# Loading State Management

## Overview

This directory contains context providers for managing global application state. The main context provided is the `LoadingContext` which centralizes loading state management across the application.

## LoadingContext

The `LoadingContext` provides a consistent way to manage loading states throughout the application. It allows components to trigger, update, and stop loading states with customizable messages and display options.

### Usage

#### 1. Import the hook in your component

```tsx
import { useLoading } from '@/contexts/LoadingContext';
```

#### 2. Use the loading state methods in your component

```tsx
const { startLoading, updateLoadingMessage, stopLoading, isLoading } = useLoading();

// Start a loading state with a message
startLoading("Loading data...");

// Update the loading message during a multi-step process
updateLoadingMessage("Processing data...");

// Stop the loading state when done
stopLoading();
```

#### 3. Example: Using in an async function

```tsx
const fetchData = async () => {
  try {
    startLoading("Fetching data...");
    
    // First step
    const response = await api.getData();
    updateLoadingMessage("Processing data...");
    
    // Second step
    const processedData = await processData(response);
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    stopLoading();
  }
};
```

### API

The `useLoading` hook provides the following methods and properties:

- **isLoading** (boolean): Current loading state
- **message** (string): Current loading message
- **showOverlay** (boolean): Whether to display as overlay or full screen
- **startLoading** (message?: string, showOverlay?: boolean): Start loading state
- **updateLoadingMessage** (message: string): Update the loading message
- **stopLoading** (): Stop loading state

### Global LoadingSpinner

The application includes a `GlobalLoading` component that automatically displays the loading spinner based on the LoadingContext state. This component is included in the root layout and doesn't need to be manually added to individual components.

### Benefits

- **Consistency**: Provides a unified loading experience across the application
- **Simplicity**: No need to manage loading state locally in each component
- **Flexibility**: Customize loading messages for each step of complex operations
- **Reduced Boilerplate**: Eliminates repetitive loading state code in components 