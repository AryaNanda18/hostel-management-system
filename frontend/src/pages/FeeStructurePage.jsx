import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function FeeStructurePage() {
    const navigate = useNavigate();

    return (
        <div className="fee-page">
            <div className="fee-header">
                <div className="container">
                    <h1>Fee Structure for Admission 2025-26</h1>
                    <p>LBSITW Hostel, Poojappura, Thiruvananthapuram</p>
                </div>
            </div>

            <div className="container fee-content">
                {/* Admission Fee Table */}
                <div className="fee-table-card">
                    <h2>📋 Admission Fees</h2>
                    <div className="fee-table-wrapper">
                        <table className="fee-table">
                            <thead>
                                <tr>
                                    <th>Fee Type</th>
                                    <th>General</th>
                                    <th>SC / ST / OEC / OBC-H</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Admission Fee</td>
                                    <td>₹ 1,000</td>
                                    <td>₹ 1,000</td>
                                </tr>
                                <tr>
                                    <td>Caution Deposit</td>
                                    <td>₹ 12,000</td>
                                    <td>₹ 3,000</td>
                                </tr>
                                <tr className="total-row">
                                    <td><strong>Total</strong></td>
                                    <td><strong>₹ 13,000</strong></td>
                                    <td><strong>₹ 4,000</strong></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Monthly Expenditure */}
                <div className="fee-table-card">
                    <h2>📅 Monthly Expenditure</h2>
                    <div className="fee-table-wrapper">
                        <table className="fee-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Item</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td>Rent</td>
                                    <td>₹ 1,260 / month</td>
                                </tr>
                                <tr>
                                    <td>2</td>
                                    <td>Establishment</td>
                                    <td>As per utilization</td>
                                </tr>
                                <tr>
                                    <td>3</td>
                                    <td>Mess Fee</td>
                                    <td>As per utilization</td>
                                </tr>
                                <tr>
                                    <td>4</td>
                                    <td>Utility Charge</td>
                                    <td>As per utilization</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Notes */}
                <div className="fee-notes-card">
                    <h2>📌 Important Notes</h2>
                    <ul>
                        {[
                            'Admission fee is non-refundable.',
                            'Caution deposit will be refunded at the time of leaving the hostel subject to clearance.',
                            'Mess fee, establishment charges and utility charges will be collected monthly as per actual utilization.',
                            'SC/ST/OEC/OBC-H students are eligible for reduced caution deposit.',
                            'Fee concession does not apply to monthly rent.',
                            'Admission is subject to availability and priority criteria.',
                        ].map((note, i) => (
                            <li key={i}>
                                <CheckCircle size={16} className="note-icon" />
                                {note}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Proceed Button */}
                <div className="fee-action">
                    <p>Please review the fee structure carefully before proceeding.</p>
                    <button
                        id="proceed-btn"
                        className="btn btn-primary btn-large"
                        onClick={() => navigate('/apply')}
                    >
                        Proceed to Application Form <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
