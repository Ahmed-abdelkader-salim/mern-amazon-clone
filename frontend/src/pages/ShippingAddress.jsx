import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import Select from "react-select";
import { getData } from "country-list";

import PageTitle from "../components/PageTitle";
import CheckoutSteps from "../components/CheckoutSteps";
import { useSaveShippingAddressMutation } from "../app/api";

const countries = getData().map((country) => ({
  label: country.name,
  value: country.code,
}));

const ShippingAddress = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [saveShippingAddress, { isLoading, isError, error }] = useSaveShippingAddressMutation();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    // First, load any existing form data from localStorage
    const savedFormData = localStorage.getItem("shippingFormData");
    if (savedFormData) {
      const formData = JSON.parse(savedFormData);
      Object.keys(formData).forEach(key => {
        setValue(key, formData[key]);
      });
    }

    // Then check for new location data
    const savedLocation = localStorage.getItem("shippingLocation");
    if (savedLocation) {
      const locationData = JSON.parse(savedLocation);
      setLocation(locationData);

      // Only update address and city if they're empty or if user wants to overwrite
      const currentAddress = getValues("address");
      const currentCity = getValues("city");
      
      if (locationData.address && (!currentAddress || currentAddress.trim() === "")) {
        setValue("address", locationData.address);
      }
      if (locationData.vicinity && (!currentCity || currentCity.trim() === "")) {
        setValue("city", locationData.vicinity);
      }

      // Remove the location data after using it
      localStorage.removeItem("shippingLocation");
    }
  }, [setValue, getValues]);

  // Save form data to localStorage whenever form changes
  const saveFormData = () => {
    const formData = getValues();
    localStorage.setItem("shippingFormData", JSON.stringify(formData));
  };

  const onSubmit = async (data) => {
    const fullData = {
      ...data,
      lat: location?.lat,
      lng: location?.lng,
    };

    try {
      await saveShippingAddress(fullData).unwrap();
      // Clear saved form data on successful submission
      localStorage.removeItem("shippingFormData");
      navigate("/payment");
    } catch (err) {
      console.error("Shipping submit error:", err);
    }
  };

  const handleChooseLocation = () => {
    // Save current form data before navigating
    saveFormData();
    navigate("/map");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageTitle title="Shipping Page" />
      <CheckoutSteps step1 step2 />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Shipping Address</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                {...register("fullName", { required: true })}
                onChange={(e) => {
                  register("fullName").onChange(e);
                  saveFormData();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500"
              />
              {errors.fullName && <p className="text-red-500 text-sm">Full Name is required</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                {...register("address", { required: true })}
                onChange={(e) => {
                  register("address").onChange(e);
                  saveFormData();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500"
              />
              {errors.address && <p className="text-red-500 text-sm">Address is required</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  {...register("city", { required: true })}
                  onChange={(e) => {
                    register("city").onChange(e);
                    saveFormData();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500"
                />
                {errors.city && <p className="text-red-500 text-sm">City is required</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  {...register("postalCode", { required: true })}
                  onChange={(e) => {
                    register("postalCode").onChange(e);
                    saveFormData();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500"
                />
                {errors.postalCode && <p className="text-red-500 text-sm">Postal Code is required</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <Controller
                control={control}
                name="country"
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={countries}
                    placeholder="Select a country"
                    className="react-select-container"
                    classNamePrefix="react-select"
                    value={countries.find((option) => option.value === field.value) || null}
                    onChange={(selectedOption) => {
                      field.onChange(selectedOption?.value);
                      saveFormData();
                    }}
                  />
                )}
              />
              {errors.country && <p className="text-red-500 text-sm">Country is required</p>}
            </div>

            <div className="border-t border-gray-200 pt-6">
              <button
                type="button"
                onClick={handleChooseLocation}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mb-4"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Choose Location On Map
              </button>

              {location ? (
                <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm">
                  <p className="text-green-800 mb-2 font-medium">Selected Location:</p>
                  <div className="space-y-1 text-green-700">
                    <p><strong>LAT:</strong> {location.lat.toFixed(6)}</p>
                    <p><strong>LNG:</strong> {location.lng.toFixed(6)}</p>
                    {location.address && <p><strong>Address:</strong> {location.address}</p>}
                    {location.name && <p><strong>Place:</strong> {location.name}</p>}
                    {location.vicinity && <p><strong>Area:</strong> {location.vicinity}</p>}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-sm text-gray-600">
                  No location selected
                </div>
              )}
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-yellow-400 hover:bg-amazonClone-amazon_yellow_hover font-medium py-3 px-8 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {isLoading ? "Saving..." : "Continue"}
              </button>
            </div>

            {isError && (
              <p className="text-red-500 text-sm pt-2">
                {error?.data?.message || "Failed to save shipping address."}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShippingAddress;