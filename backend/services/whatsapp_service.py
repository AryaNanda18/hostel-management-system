import os
import json
import sys
from datetime import datetime

def send_whatsapp_message(phone_number, message):
    """
    Mock function to send whatsapp message.
    Outputs to console and saves to instance/whatsapp_log.txt
    """
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    log_entry = f"[{timestamp}] To: {phone_number} | Message: {message}\n"
    
    # console output
    print(f"\n--- WHATSAPP MESSAGE MOCK ---", flush=True)
    print(f"To: {phone_number}", flush=True)
    print(f"Message: {message}", flush=True)
    print(f"-----------------------------\n", flush=True)
    
    # Save to log file
    try:
        log_dir = 'instance'
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)
        with open(os.path.join(log_dir, 'whatsapp_log.txt'), 'a', encoding='utf-8') as f:
            f.write(log_entry)
    except Exception as e:
        print(f"Error writing to log: {e}", flush=True)
        
    return True
