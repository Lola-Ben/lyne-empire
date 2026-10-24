"use client"
import { useState } from "react";
import AddNewProductImageUpload from "./AddNewProductImageUpload";

export default function AddNewProduct(){
    const [category, setCategory] = useState("")
    const [brand, setBrand] = useState("")
    const [otherBrand, setOtherBrand] = useState("")

    return(
        <section className="mx-auto w-full max-w-4xl rounded-xl border border-[#EFECE6] bg-[#EFECE6] p-4 text-[#935F4C] sm:p-6">
            <div className="mb-4 rounded-lg bg-white p-3">
                <h2 className="font-semibold text-base">Add New Product</h2>
            </div>
            <form className="grid grid-cols-1 gap-4 rounded-xl bg-white p-4 sm:grid-cols-2 sm:p-6">

                    <label className="flex flex-col gap-2">
                        <span className="font-semibold text-[#934F4C]">Product Name</span>
                        <input type="text" placeholder="Enter Product Name" className="border border-[#EFECE6] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#935F4C]" />
                    </label>

                    <label className="flex flex-col gap-2">
                        <span className="font-semibold text-[#934F4C]">Product Price</span>
                        <input type="number" placeholder="Enter Product Price" className="border border-[#EFECE6] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#935F4C]" />
                    </label>

                    <label className="flex flex-col gap-2">
                        <span className="font-semibold text-[#934F4C]">Product Brand</span>
                        <select
                            value={brand}
                            onChange={(event) => setBrand(event.target.value)}
                            required
                            className="border border-[#EFECE6] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#935F4C]"
                        >
                            <option value="">Select a brand</option>
                            <option value="Bobbi Boss">Bobbi Boss</option>
                            <option value="Freetress">Freetress</option>
                            <option value="Janet Collection">Janet Collection</option>
                            <option value="Mayde Beauty">Mayde Beauty</option>
                            <option value="Outre">Outre</option>
                            <option value="Sensationnel">Sensationnel</option>
                            <option value="X-Pression">X-Pression</option>
                            <option value="Other">Other</option>
                        </select>
                    </label>
                    {brand === "Other" ? (
                        <label className="flex flex-col gap-2">
                            <span className="font-semibold text-[#934F4C]">Enter brand name</span>
                            <input
                                type="text"
                                name="productBrand"
                                value={otherBrand}
                                onChange={(event) => setOtherBrand(event.target.value)}
                                placeholder="Enter product brand"
                                required
                                className="border border-[#EFECE6] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#935F4C]"
                            />
                        </label>
                    ) : (
                        <input type="hidden" name="productBrand" value={brand} />
                    )}

                    <div className="sm:col-span-2">
                        <AddNewProductImageUpload />
                    </div>

                    <label className="flex flex-col gap-2 sm:col-span-2">
                        <span className="font-semibold text-[#934F4C]">Product Description</span>
                        <textarea placeholder="Enter Product Description" className="border border-[#EFECE6] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#935F4C]" />
                    </label>

                    <label className="flex flex-col gap-2">
                        <span className="font-semibold text-[#934F4C]">Product Stock</span>
                        <input type="number" placeholder="Enter Product Stock" className="border border-[#EFECE6] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#935F4C]" />
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="font-semibold text-[#934F4C]">Product Category</span>
                        <select id={"productCategory"} value={category} onChange={(e) => setCategory(e.target.value)} className="border border-[#EFECE6] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#935F4C]">
                            <option value="">Select Category</option>
                            <option value="wigs">Wigs</option>
                            <option value="extensions">Extensions</option>
                            <option value="accessories">Accessories</option>
                        </select>
                    </label>
                    <label hidden={category !== "wigs"} className="flex flex-col gap-2">
                        <span className="font-semibold text-[#934F4C]">Inches</span>
                        <input type="number" placeholder="Enter Product Inches" className="border border-[#EFECE6] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#935F4C]" />
                    </label>
                    <button type="submit" className="rounded bg-[#935F4C] py-2 text-sm font-medium text-white transition-colors hover:bg-[#7A4E3E] sm:col-span-2">Add Product</button>
            </form>
        </section>
    )
}