import React, { useState } from 'react';
import './Disperse.css';

const Disperse: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [lineNumbers, setLineNumbers] = useState<number[]>([1]);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [buttonBackgroundColor, setButtonBackgroundColor] = useState<string>('rgb(144, 99, 196)'); // Default button background color

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    const lines = e.target.value.split('\n').filter(Boolean);
    setLineNumbers([...Array(lines.length || 1)].map((_, index) => index + 1));
  };

  const onSubmit = () => {
    setErrorMessages([]);

    const inputLines = inputText.split('\n').filter(Boolean);
    const validEntries: string[] = [];
    const duplicateAddresses: Map<string, number[]> = new Map();

    for (let i = 0; i < inputLines.length; i++) {
      const line = inputLines[i];

      if (!validateEntry(line, i + 1)) {
        setButtonBackgroundColor('black'); // Change button background color to black
        // Continue validation for other lines even if one line has an error
      }

      const [address] = getAddressAndAmount(line);

      if (!duplicateAddresses.has(address)) {
        duplicateAddresses.set(address, [i + 1]);
      } else {
        duplicateAddresses.get(address)?.push(i + 1);
      }

      validEntries.push(line);
    }

    const duplicates = Array.from(duplicateAddresses.entries()).filter((entry) => entry[1].length > 1);
    handleDuplicates(duplicates);
  };

  const validateEntry = (entry: string, lineNumber: number): boolean => {
    const [address, amount] = getAddressAndAmount(entry);

    if (!address || !amount) {
      setErrorMessages((prevMessages) => [...prevMessages, `Line ${lineNumber}: Missing address or amount`]);
      return false;
    }

    if (!address.startsWith('0x')) {
      setErrorMessages((prevMessages) => [...prevMessages, `Line ${lineNumber}: Invalid Ethereum address`]);
      return false;
    }

    if (address.length !== 42) {
      setErrorMessages((prevMessages) => [...prevMessages, `Line ${lineNumber}: Invalid Ethereum address length`]);
      return false;
    }

    if (!/^[0-9]+$/.test(amount.slice(-2))) {
      setErrorMessages((prevMessages) => [...prevMessages, `Line ${lineNumber}: Invalid characters at the end of Ethereum address`]);
      return false;
    }

    if (isNaN(Number(amount))) {
      setErrorMessages((prevMessages) => [...prevMessages, `Line ${lineNumber}: Invalid amount`]);
      return false;
    }

    return true;
  };

  const getAddressAndAmount = (entry: string): [string, string] => {
    const parts = entry.split(/[= ,]/).filter(Boolean);
    if (parts.length === 2) {
      return [parts[0], parts[1]];
    }
    return ['', ''];
  };

  const handleDuplicates = (duplicates: [string, number[]][]) => {
    for (const [address, lines] of duplicates) {
      // Handle duplicates as per your requirements
      // For now, we will delete duplicates
      const firstLineNumber = lines[0];
      for (let i = 1; i < lines.length; i++) {
        const lineNumberToDelete = lines[i] - i;
        setInputText((prevInputText) =>
          prevInputText.split('\n').filter((_, index) => index + 1 !== lineNumberToDelete).join('\n')
        );
      }
      setErrorMessages((prevMessages) => [
        ...prevMessages,
        `Line ${firstLineNumber}: Duplicate addresses (${lines.join(', ')}) removed`,
      ]);
    }
  };

  return (
    <div className="disperse">
      <div className="header-container">
        <div className="left-header">Addresses with Amounts</div>
        <div className="right-header">Upload File</div>
      </div>
      <div className="input-container">
        <div className="line-numbers">
          {lineNumbers.map((lineNumber) => (
            <div key={lineNumber} className="line-number">
              {lineNumber}
            </div>
          ))}
        </div>
        <div className="input-wrapper">
          <textarea
            className="input-box"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Type or paste your text here..."
          />
        </div>
      </div>
      <div className="header-container">
        <div className="left-header">Separated by ',' or '=' or ' '</div>
        <div className="right-header">Show Example</div>
      </div>
      {errorMessages.length > 0 && (
        <div className="error-message" style={{ border: '1px solid red', color: 'red', textAlign: 'left', padding: '0.5rem', marginBottom: '1rem', width: '100%' }}>
          {errorMessages.map((errorMessage, index) => (
            <div key={index}>❗️ {errorMessage}</div>
          ))}
        </div>
      )}
      <div className="button-container">
        <button className="violet-button" onClick={onSubmit} style={{ backgroundColor: buttonBackgroundColor }}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Disperse;
